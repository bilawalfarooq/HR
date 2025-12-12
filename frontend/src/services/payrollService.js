import api from './api';

const payrollService = {
    // Salary Structure
    getSalaryStructures: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/payroll/salary-structures${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    getEmployeeSalaryStructure: async (employeeId) => {
        const response = await api.get(`/payroll/salary-structures/employee/${employeeId}`);
        return response.data;
    },

    createSalaryStructure: async (data) => {
        const response = await api.post('/payroll/salary-structures', data);
        return response.data;
    },

    // Payroll
    processPayroll: async (month, year) => {
        const response = await api.post('/payroll/process', { month, year });
        return response.data;
    },

    getPayrolls: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/payroll${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    getPayrollById: async (id) => {
        const response = await api.get(`/payroll/${id}`);
        return response.data;
    },

    updatePayroll: async (id, data) => {
        const response = await api.put(`/payroll/${id}`, data);
        return response.data;
    },

    markPayrollAsPaid: async (id, data) => {
        const response = await api.put(`/payroll/${id}/mark-paid`, data);
        return response.data;
    },

    getPayrollSummary: async (month, year) => {
        const response = await api.get(`/payroll/summary?month=${month}&year=${year}`);
        return response.data;
    },

    // Payslip
    generatePayslip: async (id, sendEmail = false) => {
        const response = await api.post(`/payroll/${id}/generate-payslip`, { sendEmail });
        return response.data;
    },

    // Exports
    exportExcel: async (month, year) => {
        const response = await api.get(`/payroll/export/excel?month=${month}&year=${year}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    exportCSV: async (month, year) => {
        const response = await api.get(`/payroll/export/csv?month=${month}&year=${year}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Reports
    getPFStatement: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/payroll/reports/pf${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    getTaxStatement: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/payroll/reports/tax${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    }
};

export default payrollService;

