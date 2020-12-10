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

class AggregateReportStatistics {
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
  medianNumberOfAttendedByDisciplines;
  medianNumberOfMissedByDisciplines;

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
      medianNumberOfAttendedByDisciplines: this.medianNumberOfAttendedByDisciplines,
      medianNumberOfMissedByDisciplines: this.medianNumberOfMissedByDisciplines
    };
  }

  setTotalStatisticsToZero() {
    this.totalAverage
      = this.totalMedian
      = this.totalMinimum
      = this.totalMaximum
      = 0;

    this.medianTherapyIntensityByDisciplines
      = this.medianNumberOfAttendedByDisciplines
      = this.medianNumberOfMissedByDisciplines
      = new Array(therapyTypesForReport.length).fill(0);
  }

  isValidDate(date, start, end) {
    return moment(date, DATE_FORMAT).isBetween(start, end, null, '[]');
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

  addToSessionMap(appointment, sMap) {
    let type = appointment.therapyType;

    if (sMap.has(type)) {
      this.addToPatientRecordMap(appointment, sMap.get(type));
    } else {
      let patientRecordMap = new Map();
      this.addToPatientRecordMap(appointment, patientRecordMap);
      sMap.set(type, patientRecordMap);
    }
  }

  addToPatientRecordMap(appointment, prMap) {
    let duration = appointment.duration;
    let prKey = appointment.patientId + appointment.recordId;

    if (prMap.has(prKey)) {
      prMap.get(prKey).push(duration);
    } else {
      prMap.set(prKey, [duration]);
    }
  }

  filterAndProcessAppointments() {
    this.appointments.forEach(appointment => {
      if (this.isValidDate(appointment.date, this.startDate, this.endDate)) {
        let duration = appointment.duration;

        if (appointment.isAttend) {
          this.addToSessionMap(appointment, this.attendedSessions);
          this.allAttendedDurations.push(duration);
          this.totalSum += duration;
        } else {
          this.addToSessionMap(appointment, this.missedSessions);
        }
      }
    });
  }

  medianProcessingWrapper(patientRecordMap, processFunc) {
    let median = 0;

    if (patientRecordMap) {
      let processedArr = processFunc(patientRecordMap);
      this.sortIntArr(processedArr);
      median = this.getMedian(processedArr);
    }

    return median;
  }

  createMedianTherapyIntensityByDisciplines() {
    this.medianTherapyIntensityByDisciplines = [];

    therapyTypesForReport.forEach(type => {
      this.medianTherapyIntensityByDisciplines.push(
        this.medianProcessingWrapper(this.attendedSessions.get(type), (map) => {
          let durationArr = [];
          map.forEach((value) => {
            durationArr = durationArr.concat(value);
          });
          return durationArr;
        })
      );
    });
  }

  createMedianNumberOfAttendedByDisciplines() {
    this.medianNumberOfAttendedByDisciplines = [];

    therapyTypesForReport.forEach(type => {
      this.medianNumberOfAttendedByDisciplines.push(
        this.medianProcessingWrapper(this.attendedSessions.get(type), (map) => {
          let occurenceArr = [];
          map.forEach((value) => {
            occurenceArr.push(value.length);
          });
          return occurenceArr;
        })
      );
    });
  }

  createMedianNumberOfMissedByDisciplines() {
    this.medianNumberOfMissedByDisciplines = [];

    therapyTypesForReport.forEach(type => {
      this.medianNumberOfMissedByDisciplines.push(
        this.medianProcessingWrapper(this.missedSessions.get(type), (map) => {
          let occurenceArr = [];
          map.forEach((value) => {
            occurenceArr.push(value.length);
          });
          return occurenceArr;
        })
      );
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
      this.createMedianNumberOfAttendedByDisciplines();
    } else {
      this.setTotalStatisticsToZero();
    }

    this.createMedianNumberOfMissedByDisciplines();

    return this.getStatisticsObject();
  }
}

export default AggregateReportStatistics;