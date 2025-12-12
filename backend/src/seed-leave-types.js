import { LeaveType, sequelize } from './models/index.js';

const seedLeaveTypes = async () => {
    try {
        // We need an organization ID. Assuming 1 for now or fetching first.
        // In multi-tenant, we should probably seed for the user's org.
        // Let's just create for org_id = 1 (if exists) or all orgs?
        // For this dev env, let's assume org_id=1.

        const orgId = 1;

        const types = [
            { name: 'Annual Leave', days_allowed: 14, description: 'Standard annual leave' },
            { name: 'Sick Leave', days_allowed: 10, description: 'Medical leave' },
            { name: 'Casual Leave', days_allowed: 7, description: 'Personal matters' },
            { name: 'Unpaid Leave', days_allowed: 0, description: 'Leave without pay' }
        ];

        for (const t of types) {
            await LeaveType.findOrCreate({
                where: { name: t.name, organization_id: orgId },
                defaults: {
                    ...t,
                    organization_id: orgId
                }
            });
        }

        console.log('Leave Types seeded');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seedLeaveTypes();
