import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

export const StatCardSkeleton = () => (
    <Card>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
                </Box>
                <Skeleton variant="circular" width={48} height={48} />
            </Box>
        </CardContent>
    </Card>
);

export const DashboardSkeleton = () => (
    <Box>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                    <StatCardSkeleton />
                </Grid>
            ))}
        </Grid>
        <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={30} />
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={30} />
                        <Box sx={{ mt: 2 }}>
                            {[1, 2, 3, 4].map((item) => (
                                <Skeleton key={item} variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
);

export default DashboardSkeleton;

