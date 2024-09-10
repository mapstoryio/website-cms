import express from 'express'
import nodemailerSendgrid from 'nodemailer-sendgrid'
import payload from 'payload'
import nodemailer from 'nodemailer'
import { syncToAlgoliaCron } from './collections/CommunityHelp/syncToAlgolia'
import { payloadCloudEmail  } from './resend'
// eslint-disable-next-line
require('dotenv').config()
type TransportArgs = Parameters<typeof nodemailer.createTransport>[0]
const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

const sendGridAPIKey = process.env.SENDGRID_API_KEY

const sendgridConfig = {
  transportOptions: nodemailerSendgrid({
    apiKey: sendGridAPIKey,
  }),
}

const start = async (): Promise<void> => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,

    email:
    //@ts-ignore
    payloadCloudEmail({
      fromName:"Mads",
      defaultDomain:"mapstory.io",
      apiKey: process.env.RESEND_API_KEY || '',
    }),
    /*
     resendAdapter({
      defaultFromAddress: 'dev@payloadcms.com',
      defaultFromName: 'Payload CMS',
      apiKey: process.env.RESEND_API_KEY || '',
    }),
    */
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  // Add your own express routes here

  app.listen(process.env.PORT, async () => {
    payload.logger.info(`Server listening on port ${process.env.PORT}`)
  })

  syncToAlgoliaCron.start()
}

start()
