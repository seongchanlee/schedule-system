import moment from "moment";
import { TherapyType } from "enums";

const DATE_FORMAT = "YYYY-MM-DD";

let therapyTypesForReport = [
  TherapyType.PT,
  TherapyType.PTRA,
  TherapyType.OT,
  TherapyType.OTRA,
  TherapyType.SLP,
  TherapyType.SLPA
];

class IndividualReportStatistics {
  startDate;
  endDate;
  attendedSessions;
  missedSessions;
  allAttendedDurations;
  totalSum;

  totalAverage;
  totalMedian;
  totalMinimum;
  totalMaximum;

  medianTherapyIntensityByDisciplines;
  numberOfAttendedByDisciplines;
  numberOfMissedByDisciplines;

  staffNameTypeMap;

  constructor(appointments) {
    this.appointments = appointments;
  }

  getStatisticsObject() {
    return {
      totalAverage: this.totalAverage,
      totalMedian: this.totalMedian,
      totalMinimum: this.totalMinimum,
      totalMaximum: this.totalMaximum,
      medianTherapyIntensityByDisciplines: this.medianTherapyIntensityByDisciplines,
      numberOfAttendedByDisciplines: this.numberOfAttendedByDisciplines,
      numberOfMissedByDisciplines: this.numberOfMissedByDisciplines,
      staffNameTypeMap: this.staffNameTypeMap
    };
  }

  setTotalStatisticsToZero() {
    this.totalAverage
      = this.totalMedian
      = this.totalMinimum
      = this.totalMaximum
      = 0;

    this.medianTherapyIntensityByDisciplines
      = this.numberOfAttendedByDisciplines
      = this.numberOfMissedByDisciplines
      = new Array(therapyTypesForReport.length).fill(0);

    this.staffNameTypeMap = new Map();
  }

  isValidAppointment(appointment, start, end) {
    // Misnomer alert: appointment's startDate is currently the date of the appointment.
    return moment(appointment.startDate, DATE_FORMAT).isBetween(start, end, null, '[]');
  }

  sortIntArr(arr) {
    arr.sort((a, b) => a - b);
  }

  getMedian(arr) {
    if (arr.length === 0) {
      return 0
    } else if (arr.length === 1) {
      return arr[0];
    }

    let half = Math.floor(arr.length / 2);

    if (arr.length % 2) {
      return arr[half];
    } else {
      return (arr[half - 1] + arr[half]) / 2;
    }
  }

  filterAndProcessAppointments() {
    this.appointments.forEach(appointment => {
      if (this.isValidAppointment(appointment, this.startDate, this.endDate)) {
        let type = appointment.therapyType;
        let staffName = appointment.staffName;

        this.staffNameTypeMap.set(staffName, type);

        if (appointment.isAttend) {
          let duration = appointment.duration;

          if (this.attendedSessions.has(type)) {
            this.attendedSessions.get(type).push(duration);
          } else {
            this.attendedSessions.set(type, [duration]);
          }

          this.allAttendedDurations.push(duration);
          this.totalSum += duration;
        } else {
          this.missedSessions.set(type, (this.missedSessions.get(type) || 0) + 1);
        }
      }
    });
  }

  createMedianTherapyIntensityByDisciplines() {
    this.medianTherapyIntensityByDisciplines = [];
    therapyTypesForReport.forEach(type => {
      let tiArr = this.attendedSessions.get(type) || [];
      this.sortIntArr(tiArr);

      this.medianTherapyIntensityByDisciplines.push(this.getMedian(tiArr));
    });
  }

  createNumberOfAttendedByDisciplines() {
    this.numberOfAttendedByDisciplines = [];

    therapyTypesForReport.forEach(type => {
      this.numberOfAttendedByDisciplines.push(
        (this.attendedSessions.get(type) || []).length
      )
    });
  }

  createNumberOfMissedByDisciplines() {
    this.numberOfMissedByDisciplines = [];

    therapyTypesForReport.forEach(type => {
      this.numberOfMissedByDisciplines.push(
        this.missedSessions.get(type) || 0
      )
    });
  }

  retrieveStatistics(startDateStr, endDateStr) {
    if (this.appointments.length === 0) {
      this.setTotalStatisticsToZero();
      return this.getStatisticsObject();
    }

    this.startDate = moment(startDateStr, DATE_FORMAT);
    this.endDate = moment(endDateStr, DATE_FORMAT);
    this.attendedSessions = new Map();
    this.missedSessions = new Map();
    this.staffNameTypeMap = new Map();
    this.allAttendedDurations = [];
    this.totalSum = 0;

    this.filterAndProcessAppointments();

    if (this.allAttendedDurations.length > 0) {
      this.sortIntArr(this.allAttendedDurations);

      this.totalAverage = Math.round(this.totalSum / this.allAttendedDurations.length);
      this.totalMedian = this.getMedian(this.allAttendedDurations);
      this.totalMinimum = this.allAttendedDurations[0];
      this.totalMaximum = this.allAttendedDurations[this.allAttendedDurations.length - 1];

      this.createMedianTherapyIntensityByDisciplines();
      this.createNumberOfAttendedByDisciplines();
    } else {
      this.setTotalStatisticsToZero();
    }

    this.createNumberOfMissedByDisciplines();

    return this.getStatisticsObject();
  }
}

export default IndividualReportStatistics;