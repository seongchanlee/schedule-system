module.exports = {
  staffs: [{
    id: 6,
    username: "rolee@test.com",
    email: "rolee@test.com",
    phone_number: "778-232-4252",
    first_name: "Ro",
    last_name: "Lee",
    type: "Staff",
    permission_level: "Medium"
  }],
  patients: [{
    "id": 1,
    "username": "1234",
    email: "seongchan@test.com",
    phone_number: "778-123-4567",
    first_name: "Seongchan",
    last_name: "Lee",
    type: "Patient",
    permission_level: "Low"
  }],
  appointments: [
    {
      "appointment": {
        "id": 2,
        "patient_id": 1,
        "staff_id": 6,
        "record_id": 2,
        "type_of_therapy": "type2",
        "start_date": "2019-01-02T08:00:00.000Z",
        "end_date": "2019-01-02T08:00:00.000Z",
        "repetition": "none",
        "start_time": "12:30:00",
        "end_time": "14:00:00",
        "staff": {
          "id": 6,
          "username": "rolee@test.com",
          "email": "rolee@test.com",
          "phone_number": "778-232-4252",
          "first_name": "Ro",
          "last_name": "Lee",
          "type": "Staff",
          "permission_level": "Medium"
        },
        "patient": {
          "id": 1,
          "username": "1234",
          "email": "seongchan@test.com",
          "phone_number": "778-123-4567",
          "first_name": "Seongchan",
          "last_name": "Lee",
          "type": "Patient",
          "permission_level": "Low"
        }
      },
      "patient": {
        "id": 1,
        "username": "1234",
        "email": "seongchan@test.com",
        "phone_number": "778-123-4567",
        "first_name": "Seongchan",
        "last_name": "Lee",
        "type": "Patient",
        "permission_level": "Low"
      }
    },
    {
      "appointment": {
        "id": 4,
        "patient_id": 7,
        "staff_id": 6,
        "record_id": 4,
        "type_of_therapy": "type3",
        "start_date": "2019-01-04T08:00:00.000Z",
        "end_date": "2019-01-04T08:00:00.000Z",
        "repetition": "none",
        "start_time": "15:30:00",
        "end_time": "17:00:00",
        "staff": {
          "id": 6,
          "username": "rolee@test.com",
          "email": "rolee@test.com",
          "phone_number": "778-232-4252",
          "first_name": "Ro",
          "last_name": "Lee",
          "type": "Staff",
          "permission_level": "Medium"
        },
        "patient": {
          "id": 7,
          "username": "9101",
          "email": "david@test.com",
          "phone_number": "778-627-2829",
          "first_name": "David",
          "last_name": "Kim",
          "type": "Patient",
          "permission_level": "Low"
        }
      },
      "patient": {
        "id": 7,
        "username": "9101",
        "email": "david@test.com",
        "phone_number": "778-627-2829",
        "first_name": "David",
        "last_name": "Kim",
        "type": "Patient",
        "permission_level": "Low"
      }
    }
  ],
  expectedResult: [
    {
      "id": 2,
      "patient_id": 1,
      "staff_id": 6,
      "record_id": 2,
      "type_of_therapy": "type2",
      "start_date": "2019-01-02T08:00:00.000Z",
      "end_date": "2019-01-02T08:00:00.000Z",
      "repetition": "none",
      "start_time": "12:30:00",
      "end_time": "14:00:00",
      "staff": {
        "id": 6,
        "username": "rolee@test.com",
        "email": "rolee@test.com",
        "phone_number": "778-232-4252",
        "first_name": "Ro",
        "last_name": "Lee",
        "type": "Staff",
        "permission_level": "Medium"
      },
      "patient": {
        "id": 1,
        "username": "1234",
        "email": "seongchan@test.com",
        "phone_number": "778-123-4567",
        "first_name": "Seongchan",
        "last_name": "Lee",
        "type": "Patient",
        "permission_level": "Low"
      },
    },
    {
      "id": 4,
      "patient_id": 7,
      "staff_id": 6,
      "record_id": 4,
      "type_of_therapy": "type3",
      "start_date": "2019-01-04T08:00:00.000Z",
      "end_date": "2019-01-04T08:00:00.000Z",
      "repetition": "none",
      "start_time": "15:30:00",
      "end_time": "17:00:00",
      "staff": {
        "id": 6,
        "username": "rolee@test.com",
        "email": "rolee@test.com",
        "phone_number": "778-232-4252",
        "first_name": "Ro",
        "last_name": "Lee",
        "type": "Staff",
        "permission_level": "Medium"
      },
      "patient": {
        "id": 7,
        "username": "9101",
        "email": "david@test.com",
        "phone_number": "778-627-2829",
        "first_name": "David",
        "last_name": "Kim",
        "type": "Patient",
        "permission_level": "Low"
      },
    }
  ]
};