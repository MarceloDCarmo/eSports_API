import express from 'express'
import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from './utils/convertHourStringToMinutes'
import { convertMinutesToHourString } from './utils/convertMinutesToHourString'
import cors from 'cors'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())
app.use(cors())

app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })
    
    return res.json(games)
})

app.get('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true
        },
        where: {
            gameId, 
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return res.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd)
        }
    }))
})

app.get('/ads/:id/discord', async (req, res) => {
    const adId = req.params.id

    const discord = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id: adId
        }
    })

    return res.json(discord)
})

app.post('/games/:id/ads', async (req, res) => {
    const ad = req.body
    const gameId = req.params.id

    const createAd = await prisma.ad.create({
        data: {
            ...ad,
            hourStart: convertHourStringToMinutes(ad.hourStart),
            hourEnd: convertHourStringToMinutes(ad.hourEnd),
            weekDays: ad.weekDays.join(','),
            gameId
        }
    })

    return res.status(201).json({
        ...createAd,
        hourStart: convertMinutesToHourString(createAd.hourStart),
        hourEnd: convertMinutesToHourString(createAd.hourEnd),
    })
})

app.listen(3000, () => console.log('Server listen on port 3000'))