[Re-Medi]
(https://devpost.com/software/re-medi)

"It's not about the technology, the money or the solution, it's about people."

Every year, millions of elderly and chronically ill patients risk their lives not because of lack of treatment, but because of missed or mistaken medications. The World Health Organization reports that poor medication adherence causes 10% of hospitalization and 125,000 preventable deaths annually in the U.S. alone (Zullig et.al, 2018).

Patients living alone, those battling memory loss, or struggling with language barriers often cannot reliably identify their medications or follow complex schedules. A wrong pill at the wrong time can turn manageable illnesses into life-threatening emergencies.

What about reminders? - most reminder apps just buzz; they don’t check if the right pill is actually taken.

Our inspiration comes from watching loved ones - grandparents, friends, neighbors - struggle daily with pill bottles that look identical and instructions they can’t easily read. Their fear, confusion, and helplessness drove us to act.

We believe healthcare should be simple, accessible, and compassionate - because no one should suffer simply because they forgot or couldn’t understand which medicine to take.

What it does

Re-Medi (Reminder + Medication) was built to tackle this problem:

✅ Real-time visual confirmation: through the patient's camera, the application will look for the correct medication that the patient should take according to each reminder and verify in real time, ensuring the correct pill is taken. It then provides patients with essential instructions like "before/after meal", dosage, helpful facts about the medication (powered by Gemini API).

✅ Timely Reminders: scheduled, personalized emails with direct link to the application, with information on dosage tracking for reassurance and safety.

✅ Minimal patient effort: intuitive, no complicated installations or maintenance.

✅ Secure patient data: stored safely using MongoDB Atlas + encrypted APIs.

How we built it

We designed the backend using Node.js and Express.js to manage patient data and medication schedules stored in MongoDB Atlas.

Built the frontend with React.js and TailwindCSS for a clean, accessible user interface.


Implemented Gmail API to send personalized email reminders to patients.

Integrated Google Gemini API to generate smart, positive pill-taking tips automatically.

Created an elegant splash screen for better user experience.

Built and deployed on a single unified AWS EC2 server so both frontend and backend operate seamlessly from the same domain.
