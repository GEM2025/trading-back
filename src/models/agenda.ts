
import { Schema, model } from 'mongoose';
import { IAgendaJob } from '../interfaces/agenda.interface';

const AgendaJobSchema = new Schema<IAgendaJob>({
    name: String,
    type: String,
    priority: Number,
    nextRunAt: Date,
    // include other fields schema as per your needs
    repeatInterval: String,
});

// use the name that AgendaJS defines (the word Jobs in capital)
const AgendaModel = model("AgendaJob", AgendaJobSchema, "agendaJobs");  // mongoose lowercase and pluralizes, passing the third argument overrides that
export default AgendaModel;
