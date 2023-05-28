// jobs scheduling
export interface IAgendaJob {
    name: string;
    type: string;
    priority: number;
    nextRunAt: Date;
    // include other fields as per your needs
    repeatInterval: String;
}