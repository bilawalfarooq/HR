import sequelize from '../config/database.js';
import Organization from './Organization.js';
import Role from './Role.js';
import User from './User.js';
import Department from './Department.js';
import Employee from './Employee.js';
import Team from './Team.js';

// Define associations

// Organization associations
Organization.hasMany(Role, { foreignKey: 'organization_id', as: 'roles' });
Organization.hasMany(User, { foreignKey: 'organization_id', as: 'users' });
Organization.hasMany(Department, { foreignKey: 'organization_id', as: 'departments' });
Organization.hasMany(Team, { foreignKey: 'organization_id', as: 'teams' });
Organization.hasMany(Employee, { foreignKey: 'organization_id', as: 'employees' });

// Role associations
Role.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// User associations
User.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });

// Department associations
Department.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Department.hasMany(Team, { foreignKey: 'department_id', as: 'teams' });
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });

// Team associations
Team.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Team.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Team.hasMany(Employee, { foreignKey: 'team_id', as: 'members' });
Team.belongsTo(Employee, { foreignKey: 'team_lead_id', as: 'teamLead' });

// Employee associations
Employee.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Employee.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Employee.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
Employee.hasMany(Employee, { foreignKey: 'manager_id', as: 'subordinates' });

// Export models and sequelize instance
export {
    sequelize,
    Organization,
    Role,
    User,
    Department,
    Team,
    Employee
};

export default {
    sequelize,
    Organization,
    Role,
    User,
    Department,
    Team,
    Employee
};
