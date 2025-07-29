const axios = require('axios');

async function demonstrateApp() {
    console.log('🚀 Downtime Tracker Application - Working Demonstration\n');
    
    try {
        // 1. Login
        console.log('1️⃣ Testing Login...');
        const loginResponse = await axios.post('http://localhost:5000/api/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful! Token received.\n');
        
        // 2. Get Channels
        console.log('2️⃣ Fetching Channels...');
        const channelsResponse = await axios.get('http://localhost:5000/api/channels', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Channels loaded:', channelsResponse.data.length, 'channels');
        console.log('   Channels:', channelsResponse.data.map(c => c.name).join(', '));
        console.log();
        
        // 3. Add Sample Downtime Records
        console.log('3️⃣ Adding Sample Downtime Records...');
        
        // Sample 1: Scheduled downtime for ATM Switch
        await axios.post('http://localhost:5000/api/downtime', {
            channel_id: 1, // ATM Switch
            downtime_type: 'scheduled',
            start_time: '2025-01-28T02:00:00',
            end_time: '2025-01-28T02:30:00',
            duration_minutes: 30,
            reason: 'Regular maintenance window'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Added scheduled downtime for ATM Switch (30 mins)');
        
        // Sample 2: Unscheduled downtime for UPI Switch
        await axios.post('http://localhost:5000/api/downtime', {
            channel_id: 3, // UPI Switch
            downtime_type: 'unscheduled',
            start_time: '2025-01-28T14:15:00',
            end_time: '2025-01-28T14:25:00',
            duration_minutes: 10,
            reason: 'Network connectivity issue'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Added unscheduled downtime for UPI Switch (10 mins)');
        
        // Sample 3: Another scheduled downtime for Mobile Banking
        await axios.post('http://localhost:5000/api/downtime', {
            channel_id: 5, // Mobile Banking
            downtime_type: 'scheduled',
            start_time: '2025-01-28T03:00:00',
            end_time: '2025-01-28T03:45:00',
            duration_minutes: 45,
            reason: 'System upgrade'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Added scheduled downtime for Mobile Banking (45 mins)');
        console.log();
        
        // 4. Get Report Data
        console.log('4️⃣ Generating Report Data...');
        const reportResponse = await axios.get('http://localhost:5000/api/downtime/report', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                start_date: '2025-01-28T00:00:00',
                end_date: '2025-01-28T23:59:59'
            }
        });
        
        console.log('✅ Report data generated successfully!');
        console.log('\n📊 Sample Report Data:');
        console.log('┌─────────────────┬─────────────┬─────────────────┬─────────────────┐');
        console.log('│ Channel         │ Scheduled   │ Unscheduled     │ Total Incidents │');
        console.log('├─────────────────┼─────────────┼─────────────────┼─────────────────┤');
        
        reportResponse.data.forEach(channel => {
            const scheduled = channel.scheduled_downtime || 0;
            const unscheduled = channel.unscheduled_downtime || 0;
            const total = channel.scheduled_count + channel.unscheduled_count;
            
            if (scheduled > 0 || unscheduled > 0) {
                console.log(`│ ${channel.channel_name.padEnd(15)} │ ${scheduled.toString().padStart(9)} mins │ ${unscheduled.toString().padStart(13)} mins │ ${total.toString().padStart(13)} │`);
            }
        });
        console.log('└─────────────────┴─────────────┴─────────────────┴─────────────────┘');
        console.log();
        
        // 5. Get Detailed Records
        console.log('5️⃣ Fetching Detailed Records...');
        const detailedResponse = await axios.get('http://localhost:5000/api/downtime', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                start_date: '2025-01-28T00:00:00',
                end_date: '2025-01-28T23:59:59'
            }
        });
        
        console.log('✅ Detailed records retrieved:', detailedResponse.data.length, 'records');
        console.log('\n📋 Sample Detailed Records:');
        detailedResponse.data.forEach((record, index) => {
            if (index < 3) { // Show first 3 records
                const startTime = new Date(record.start_time).toLocaleTimeString();
                const endTime = new Date(record.end_time).toLocaleTimeString();
                console.log(`   ${index + 1}. ${record.channel_name} - ${record.downtime_type} (${record.duration_minutes} mins)`);
                console.log(`      Time: ${startTime} - ${endTime}`);
                console.log(`      Reason: ${record.reason}`);
                console.log();
            }
        });
        
        // 6. Test User Management (Admin only)
        console.log('6️⃣ Testing User Management...');
        const usersResponse = await axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ User management accessible. Total users:', usersResponse.data.length);
        
        console.log('\n🎉 All tests passed! Application is working correctly.');
        console.log('\n📱 Access the web interface at: http://localhost:3000');
        console.log('🔑 Login with: admin / admin123');
        console.log('\n✨ Features demonstrated:');
        console.log('   ✅ Authentication & Authorization');
        console.log('   ✅ Channel Management');
        console.log('   ✅ Downtime Recording (Scheduled & Unscheduled)');
        console.log('   ✅ Report Generation');
        console.log('   ✅ Detailed Records View');
        console.log('   ✅ User Management');
        
    } catch (error) {
        console.error('❌ Error during demonstration:', error.response?.data || error.message);
    }
}

// Run the demonstration
demonstrateApp();