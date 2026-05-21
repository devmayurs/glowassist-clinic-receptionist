# AI Receptionist Agent for Dental Clinic — Full Project Prompt

I want to build a fully operational AI Receptionist Agent for a dental clinic using a LOCAL self-hosted setup to minimize monthly operational costs.

The system should include:

* Local n8n setup
* Frontend dashboard
* Backend APIs
* AI voice/chat assistant
* Appointment management
* Patient data tracking
* Automated reminders
* Reports and analytics

The project must be production-ready and designed so I can provide this as a monthly maintenance service to dental clinics.

My goal:

* Keep infrastructure costs very low
* Run maximum services locally/self-hosted
* Reduce dependency on expensive SaaS tools
* Maintain full control over patient data
* Create recurring monthly revenue from clinics

---

# Project Overview

The dental clinic receptionist is very busy and cannot always:

* attend all calls
* answer all patient queries
* note down patient information
* manage appointments properly
* record feedback and conversation summaries

I want to build an AI Agent that acts as an automated receptionist.

The AI agent should:

* Answer incoming calls automatically
* Reply to WhatsApp/SMS/chat messages
* Talk naturally with patients
* Answer clinic FAQs
* Check appointment availability
* Schedule/reschedule/cancel appointments
* Record patient notes and conversation summaries
* Track patient feedback
* Handle reminders and follow-ups

The clinic staff should be able to:

* View appointments
* Review patient conversations
* Check missed calls
* See urgent patient cases
* Track reports and analytics
* Manage appointment slots easily

---

# Preferred Tech Stack (Low Cost + Local Setup)

I want suggestions and implementation using:

## Automation Layer

* Local self-hosted n8n

## Backend

* Node.js + Express or Fastify
* REST APIs
* WebSocket support if needed

## Frontend

* React + TypeScript
* Tailwind CSS
* Dashboard UI

## Database

* PostgreSQL preferred
  OR
* Supabase self-hosted
  OR
* MySQL if simpler

## AI Layer

* Claude API OR OpenAI API
* Suggest cheapest reliable option
* Add prompt engineering strategy

## Voice System

* Twilio Voice initially
* Optional ElevenLabs integration
* Suggest cheaper alternatives if possible

## Messaging

* WhatsApp integration
* SMS integration
* Email notifications

## Authentication

* JWT auth
* Clinic admin login
* Role-based access

## Hosting

Everything should run locally first:

* Local Ubuntu server or Windows machine
* Dockerized setup preferred
* Later scalable to VPS/cloud

---

# Features Required

## Core Reception Features

* Auto-answer calls
* Greeting system
* FAQ answering
* Appointment booking
* Appointment rescheduling
* Appointment cancellation
* Reminder notifications
* Waitlist management

## Patient Information Collection

* Name
* Phone
* DOB
* Insurance info
* Symptoms
* Reason for visit
* Pain level
* Emergency detection

## AI Conversation Features

* Save full conversation logs
* Save AI-generated summaries
* Sentiment analysis
* Detect urgent dental emergencies
* Human handoff if AI gets confused

## Dashboard Features

* Appointment calendar
* Patient list
* Conversation history
* Analytics dashboard
* No-show tracking
* Feedback management
* Reminder management
* Staff notes

## Business Intelligence

* Monthly reports
* Most requested services
* Peak calling hours
* Missed calls analysis
* Revenue opportunity tracking

## Additional Features

* Google review request automation
* Birthday reminders
* 6-month dental checkup reminders
* Referral tracking
* Multi-language support
* AI training panel for custom FAQs

---

# Architecture Requirements

Please provide:

1. Full system architecture
2. Folder structure
3. Database schema
4. API structure
5. n8n workflow architecture
6. Webhook structure
7. Authentication flow
8. Twilio integration flow
9. AI conversation flow
10. Appointment booking logic
11. Reminder system logic
12. Docker setup
13. Environment variable structure
14. Logging and monitoring strategy
15. Backup strategy
16. Security best practices
17. HIPAA-style patient data precautions
18. Cost optimization strategy

---

# n8n Requirements

I specifically want:

* Self-hosted local n8n
* Separate workflows for:

  * incoming calls
  * WhatsApp messages
  * appointment booking
  * reminders
  * emergency escalation
  * feedback collection
  * report generation

Please explain:

* How to connect n8n with backend APIs
* How to trigger AI agents
* How to store logs
* How to retry failed workflows
* How to monitor workflows
* Best practices for scaling later

---

# Frontend Requirements

Build a modern dashboard with:

* Responsive design
* Calendar UI
* Patient management
* Conversation logs
* Analytics charts
* Notification center
* Role management
* Settings panel

Please suggest:

* Best React folder structure
* State management
* API handling
* Authentication handling
* Real-time updates
* Error handling

---

# Backend Requirements

Please generate:

* Complete backend architecture
* API endpoint structure
* Modular scalable architecture
* AI service layer
* Appointment service
* Notification service
* Logging service
* Authentication middleware
* Database models

Also explain:

* How to structure production-ready code
* How to maintain multiple clinic clients later
* Multi-tenant architecture possibilities

---

# AI Agent Requirements

The AI should:

* Speak naturally
* Handle interruptions
* Detect emergencies
* Escalate difficult conversations
* Remember previous patient context
* Generate summaries automatically

Please provide:

* Prompt engineering strategy
* System prompts
* Conversation memory strategy
* Context window optimization
* AI fallback handling
* Token cost optimization

---

# Maintenance & Service Business Model

I want to provide this as a monthly maintenance service to clinics.

Please explain:

* How I can manage multiple clinic clients
* How to isolate clinic data
* Monthly maintenance checklist
* Monitoring strategy
* Backup strategy
* Update strategy
* Monthly reporting system
* Billing strategy

Also provide:

* Suggested monthly pricing tiers
* Estimated monthly operational costs
* Profit margin estimation
* Scaling strategy

---

# Development Plan

Please provide:

* Step-by-step implementation roadmap
* MVP roadmap
* Phase-wise development
* Time estimation
* Priority features
* Recommended development order

---

# Deliverables Required

Generate:

* System architecture diagram
* Folder structure
* Database schema
* API design
* n8n workflow examples
* Docker compose setup
* Frontend architecture
* Backend architecture
* AI prompt examples
* Production deployment guide
* Maintenance guide

The solution should focus on:

* Low monthly cost
* Self-hosted architecture
* Easy maintenance
* Scalability
* Production readiness
* Long-term recurring business model
