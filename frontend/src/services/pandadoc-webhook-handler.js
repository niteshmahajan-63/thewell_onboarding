// Example webhook handler for PandaDoc events
// This would typically be implemented on your backend server

export class PandaDocWebhookHandler {
  constructor(webhookSecret) {
    this.webhookSecret = webhookSecret
  }

  // Validate webhook signature
  validateSignature(payload, signature) {
    const crypto = require('crypto')
    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')
    
    return `sha256=${computedSignature}` === signature
  }

  // Handle webhook events
  async handleWebhook(payload, signature) {
    // Validate the webhook signature first
    if (!this.validateSignature(payload, signature)) {
      throw new Error('Invalid webhook signature')
    }

    const event = JSON.parse(payload)
    const { event_type, data } = event

    switch (event_type) {
      case 'document_state_changed':
        return await this.handleDocumentStateChanged(data)
      
      case 'recipient_completed':
        return await this.handleRecipientCompleted(data)
      
      case 'document_completed':
        return await this.handleDocumentCompleted(data)
      
      case 'document_paid':
        return await this.handleDocumentPaid(data)
      
      default:
        console.log(`Unhandled webhook event: ${event_type}`)
        return { status: 'ignored' }
    }
  }

  async handleDocumentStateChanged(data) {
    console.log('Document state changed:', data)
    // Update your database with the new document state
    // Notify your application about the state change
    return { status: 'processed' }
  }

  async handleRecipientCompleted(data) {
    console.log('Recipient completed signing:', data)
    // Update recipient status in your system
    // Send notifications if needed
    return { status: 'processed' }
  }

  async handleDocumentCompleted(data) {
    console.log('Document completed:', data)
    // Document is fully signed by all parties
    // Update your application state
    // Trigger next steps in your workflow
    return { status: 'processed' }
  }

  async handleDocumentPaid(data) {
    console.log('Document payment completed:', data)
    // Handle payment completion if applicable
    return { status: 'processed' }
  }
}

// Express.js example usage:
/*
import express from 'express'
import { PandaDocWebhookHandler } from './pandadoc-webhook-handler.js'

const app = express()
const webhookHandler = new PandaDocWebhookHandler(process.env.PANDADOC_WEBHOOK_SECRET)

app.use('/webhook/pandadoc', express.raw({ type: 'application/json' }))

app.post('/webhook/pandadoc', async (req, res) => {
  try {
    const signature = req.headers['x-pandadoc-signature']
    const result = await webhookHandler.handleWebhook(req.body, signature)
    res.json(result)
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).json({ error: error.message })
  }
})
*/
