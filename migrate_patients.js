
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected for migration'))
  .catch(err => console.log(err));

const patientSchema = new mongoose.Schema({
    name: String,
    email: String,
    medicines: [{
        pillName: String,
        time: String,
        daysPrescribed: { type: Number, default: 0 },
        startDate: { type: Date, default: Date.now },
        dosesSent: { type: Number, default: 0 }
    }]
});

const Patient = mongoose.model('Patient', patientSchema);

async function migrate() {
    const patients = await Patient.find();

    for (const patient of patients) {
        let updated = false;

        for (const med of patient.medicines) {
            if (med.daysPrescribed === undefined) {
                med.daysPrescribed = 0;
                updated = true;
            }
            if (med.startDate === undefined) {
                med.startDate = new Date();
                updated = true;
            }
            if (med.dosesSent === undefined) {
                med.dosesSent = 0;
                updated = true;
            }
        }

        if (updated) {
            await patient.save();
            console.log(`Migrated patient: ${patient.name}`);
        }
    }

    console.log('Migration complete.');
    mongoose.connection.close();
}

migrate();
