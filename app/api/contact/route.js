import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, category, categoryTitle, priority, shareSessionId } = body

    // Validate required fields
    if (!name || !email || !message || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length < 20 || message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be between 20 and 2000 characters' },
        { status: 400 }
      )
    }

    // Format email content
    const emailSubject = `[VerityFlow Contact] ${categoryTitle} — ${subject}`
    const emailBody = `
New contact form submission

Category: ${categoryTitle}
Name: ${name}
Email: ${email}
Subject: ${subject}
${category === 'bug' ? `Priority: ${priority}\n` : ''}${category === 'bug' ? `Can share session ID: ${shareSessionId ? 'Yes' : 'No'}\n` : ''}
Message:
${message}

---
Submitted: ${new Date().toISOString()}
    `.trim()

    // Check if nodemailer is configured
    const EMAIL_SERVER = process.env.EMAIL_SERVER
    const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@verityflow.io'

    if (EMAIL_SERVER) {
      try {
        // Dynamic import nodemailer
        const nodemailer = await import('nodemailer')
        
        // Create transporter
        const transporter = nodemailer.default.createTransporter(EMAIL_SERVER)

        // Send email
        await transporter.sendMail({
          from: EMAIL_FROM,
          to: 'contact@verityflow.io',
          replyTo: email,
          subject: emailSubject,
          text: emailBody
        })

        console.log('[Contact Form] Email sent to contact@verityflow.io')
      } catch (emailError) {
        console.error('[Contact Form] Email sending failed:', emailError)
        // Don't fail the request - log to console instead
        console.log('[Contact Form] Falling back to console logging')
        console.log('---\n' + emailBody + '\n---')
      }
    } else {
      // No email server configured - log to console
      console.log('[Contact Form] EMAIL_SERVER not configured - logging to console')
      console.log('---\n' + emailBody + '\n---')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Contact Form] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
