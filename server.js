// server.js (Final Updated Code with Dose Counter Update)

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const patientSchema = new mongoose.Schema({
  pid: String,
  name: String,
  age: Number,
  sex: String,
  email: String,
  medicines: Object,
});
const Patient = mongoose.model('Patient', patientSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    await newPatient.save();
    res.json({ message: '✅ Patient Registered Successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Registration Failed' });
  }
});

async function generateSmartComment(medicineName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `Give a short, friendly, positive health tip (1-2 sentences max) about taking ${medicineName}.`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text.trim();
  } catch (err) {
    console.error('❌ Error generating smart comment:', err);
    return "Remember to take your medicine with care!";
  }
}

cron.schedule('* * * * *', async () => {
  console.log('🕐 Checking for medication reminders...');

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  try {
    const patients = await Patient.find({});

    for (const patient of patients) {
      const meds = patient.medicines;
      for (const key in meds) {
        const medicine = meds[key];

        if (medicine.daysPrescribed && medicine.dosesSent >= medicine.daysPrescribed) {
          console.log(`✅ Completed course for ${medicine.name} for ${patient.name}, skipping email.`);
          continue;
        }

        const [medHour, medMinute] = medicine.time.split(':').map(Number);

        let reminderHour = medHour;
        let reminderMinute = medMinute - 2;

        if (reminderMinute < 0) {
          reminderMinute += 60;
          reminderHour -= 1;
          if (reminderHour < 0) reminderHour = 23;
        }

        if (currentHours === reminderHour && currentMinutes === reminderMinute) {
          console.log(`📩 Sending reminder to ${patient.email} for ${medicine.name}`);

          const personalizedLink = `http://yourwebsite.com/patient?pid=${patient.pid}&time=${medicine.time}`;
          const smartComment = await generateSmartComment(medicine.name);

          await transporter.sendMail({
            from: `"Re-Medi" <${process.env.EMAIL_ID}>`,
            to: patient.email,
            subject: `💊 Medicine Reminder: ${medicine.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                <h2 style="color: #4CAF50;">Hi ${patient.name},</h2>
                <img src="cid:medicationImage" alt="Medicine Reminder" style="width:100%; height:auto; border-radius: 8px; margin-bottom: 20px;" />
                <p style="font-size: 16px;">🕑 It's almost time to take your medicine!</p>
                <ul style="font-size: 16px;">
                  <li><strong>Medicine:</strong> ${medicine.name}</li>
                  <li><strong>Scheduled Time:</strong> ${medicine.time}</li>
                  <li><strong>Comments:</strong> ${medicine.comments || 'None'}</li>
                </ul>
                <blockquote style="font-style: italic; color: #555; background: #f9f9f9; padding: 10px; border-left: 5px solid #4CAF50; margin-top: 20px;">
                  💬 Tip: ${smartComment}
                </blockquote>
                <div style="text-align: center; font-size: 20px; font-weight: bold; color: #4CAF50;">
                  🧪 Dose ${medicine.dosesSent ? medicine.dosesSent + 1 : 1} out of ${medicine.daysPrescribed || 'Daily'}
                </div>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${personalizedLink}" target="_blank" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 18px;">Help me find my Pill</a>
                </div>
                <br/>
                <p style="font-size: 14px;">Stay healthy! 🩺<br/>- Re-Medi Team</p>
              </div>
            `,
            attachments: [{ filename: 'remedi.png', path: path.join(__dirname, 'public', 'remedi.png'), cid: 'medicationImage' }]
          });

          medicine.dosesSent = (medicine.dosesSent || 0) + 1;
          await patient.save();
          console.log(`📈 Updated dose count: ${medicine.dosesSent}/${medicine.daysPrescribed || 'Daily'}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error in cron job:', err);
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
