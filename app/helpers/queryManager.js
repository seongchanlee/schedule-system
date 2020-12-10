const connection = require("@config/db/connection");
const db = connection.connectDatabase();
const mysql = require('mysql');

// Public

/**
 * When resolved, returns an array of JSON objects.
 *
 * @param {} table : the database table name
 * @param {Object} options : optional information for query
 *  {
 *    columns: {Array}  columns to select on query,
 *    where: {Object}  filter to apply on query
 *  }
 */
module.exports = {
  getBaseQuery: function(table, options = {}) {
    let stmt = "";
    if (options.columns && options.columns.length > 0) {
      stmt = mysql.format("SELECT ?? FROM ??", [options.columns, table]);
    } else {
      stmt = mysql.format("SELECT * FROM ??", table);
    }
    if (options.where && Object.keys(options.where).length > 0) {
      stmt = this.appendWhereQuery(stmt, options.where);
    }
    return stmt;
  },

  getQueryWithOverlap: function(options = {}) {
    return new Promise((resolve, reject) => {
      db.query(options, (err, results, fields) => {
        if(err) return reject(err);
        resolve(results);
      });
    })
  },

  getWithIdBaseQuery: function(table, id, options = {}) {
    const where = Object.assign({ id }, options.where);
    return this.getBaseQuery(table, Object.assign(options, { where }));
  },

  createBaseQuery: function(table, data) {
    const columns = Object.keys(data),
      values = Object.values(data);
    return mysql.format("INSERT INTO ??(??) VALUES ?", [table, columns, [values]]);
  },

  updateBaseQuery: function(table, id, data) {
    return mysql.format("UPDATE ?? SET ? WHERE id = ?", [table, data, id]);
  },

  softDeleteBaseQuery: function(table, id, data) {
    return this.updateBaseQuery(table, id, data);
  },

  hardDeleteBaseQuery: function(table, id) {
    return mysql.format("DELETE FROM ?? WHERE id = ?", [table, id]);
  },

  makeQuery: function(q) {
    return new Promise((resolve, reject) => {
      db.query(q, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  getAllEntriesFromTable: function(table, options = {}) {
    const query = this.getBaseQuery(table, options);
    return this.makeQuery(query);
  },

  getAdmissionRecordWithRecordId: function(id) {
    const query = mysql.format(`${this.getBaseQuery("Admission_record")} WHERE record_id = ?`, id);
    return this.makeQuery(query);
  },

  createThenGetEntry: async function(table, data, options = {}) {
    const insertQuery = this.createBaseQuery(table, data);
    const insertResult = await this.makeQuery(insertQuery);
    const selectQuery = this.getWithIdBaseQuery(
      table,
      data.id ? data.id : insertResult.insertId,
      options
    );
    return await this.makeQuery(selectQuery);
  },

  createEntry: async function(table, data) {
    let result;
    try {
      const insertQuery = this.createBaseQuery(table, data);
      result = await this.makeQuery(insertQuery);
    } catch(e) {
      throw e;
    }
    return result;
  },

  updateThenGetEntry: async function(table, id, data, options = {}) {
    const updateQuery = this.updateBaseQuery(table, id, data);
    const updateResult = await this.makeQuery(updateQuery);
    const selectQuery = this.getWithIdBaseQuery(table, id, options);
    return await this.makeQuery(selectQuery);
  },

  softDeleteEntry: function(table, id, data, options = {}) {
    const query = this.softDeleteBaseQuery(table, id, data);
    return this.makeQuery(query);
  },

  hardDeleteEntry: function(table, id, options = {}) {
    const query = this.hardDeleteBaseQuery(table, id);
    return this.makeQuery(query);
  },

  appendWhereQuery: function(sql, where) {
    if (!where && Object.keys(where).length === 0)
      return sql;
    sql = mysql.format(`${sql} WHERE`);
    Object.entries(where).forEach((column, index) => {
      if (index !== 0)
        sql = mysql.format(`${sql} AND`);
      sql = mysql.format(`${sql} ?? = ?`, [column[0], column[1]]);
    });
    return sql;
  }
};

