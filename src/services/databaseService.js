/**
 * Database Service - SQL query execution
 * Contains multiple SQL injection vulnerabilities
 */

class DatabaseService {
  static async query(sql, params = []) {
    return this.executeQuery(sql, params);
  }

  static async executeQuery(sql, params) {
    // Simulate database query execution
    console.log('Executing query:', sql, params);
    // VULNERABLE: In real app, this would execute raw SQL
    return {
      rows: [],
      rowCount: 0
    };
  }

  static async execute(sql) {
    return this.executeQuery(sql);
  }

  static buildSelectQuery(table, conditions) {
    // VULNERABLE: String concatenation
    const whereParts = Object.entries(conditions)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');
    return `SELECT * FROM ${table} WHERE ${whereParts}`;
  }

  static buildInsertQuery(table, data) {
    // VULNERABLE: String concatenation
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(v => `'${v}'`).join(', ');
    return `INSERT INTO ${table} (${columns}) VALUES (${values})`;
  }

  static buildUpdateQuery(table, data, conditions) {
    // VULNERABLE: String concatenation
    const setParts = Object.entries(data)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');
    const whereParts = Object.entries(conditions)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');
    return `UPDATE ${table} SET ${setParts} WHERE ${whereParts}`;
  }

  static buildComplexQuery(baseQuery, filters) {
    // VULNERABLE: Complex query building
    let query = baseQuery;
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string') {
        query += ` AND ${key} LIKE '%${value}%'`;
      } else {
        query += ` AND ${key} = ${value}`;
      }
    });
    return query;
  }
}

class QueryBuilder {
  static select(table, conditions = {}) {
    return DatabaseService.buildSelectQuery(table, conditions);
  }

  static insert(table, data = {}) {
    return DatabaseService.buildInsertQuery(table, data);
  }

  static update(table, data = {}, conditions = {}) {
    return DatabaseService.buildUpdateQuery(table, data, conditions);
  }

  static complex(baseQuery, filters = {}) {
    return DatabaseService.buildComplexQuery(baseQuery, filters);
  }
}

export { DatabaseService, QueryBuilder };