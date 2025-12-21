export class DateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  getDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  includes(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}






