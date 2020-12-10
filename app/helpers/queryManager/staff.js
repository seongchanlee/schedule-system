const qm = require("@app/helpers/queryManager");
const mysql = require('mysql');
const parent = require("@app/helpers/queryManager/user");

const TABLE_NAME = "Staff";
const PARENT_TABLE_NAME = parent.TABLE_NAME;
const VISIBILE_COLUMNS = ["therapist_type"];
const PARENT_VISIBLE_COLUMNS = parent.VISIBILE_COLUMNS;

module.exports = {
  getActiveStaffs: function(query = {}) {
    const options = {
      columns: PARENT_VISIBLE_COLUMNS.concat(VISIBILE_COLUMNS)
    };
    const where = Object.assign({...query}, { active: true });
    let stmt = mysql.format(
      `${qm.getBaseQuery(PARENT_TABLE_NAME, options)} INNER JOIN ?? USING (id)`,
      [TABLE_NAME]
    );
    stmt = qm.appendWhereQuery(stmt, where);
    return qm.makeQuery({sql: stmt, nestTables: true });
  },

  getStaffWithId: function(id) {
    return this.getActiveStaffs({id: id});
  },

  createStaff: function(data) {
    return qm.createThenGetEntry(TABLE_NAME, data);
  },

  updateStaffWithId: function(id, data) {
    return qm.updateThenGetEntry(TABLE_NAME, id, data);
  }
}
