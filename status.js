const axios = require('axios');

async function checkStatus() {
    console.log('🔍 Downtime Tracker - Application Status Check\n');
    
    // Check backend server
    try {
        const response = await axios.get('http://localhost:5000/api/channels', {
            timeout: 3000
        });
        console.log('✅ Backend Server (Port 5000): RUNNING');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend Server (Port 5000): NOT RUNNING');
        } else {
            console.log('✅ Backend Server (Port 5000): RUNNING (Unauthorized response expected)');
        }
    }
    
    // Check frontend server
    try {
        const response = await axios.get('http://localhost:3000', {
            timeout: 3000
        });
        console.log('✅ Frontend Server (Port 3000): RUNNING');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Frontend Server (Port 3000): NOT RUNNING');
        } else {
            console.log('✅ Frontend Server (Port 3000): RUNNING');
        }
    }
    
    console.log('\n📊 Current Application Data:');
    
    try {
        // Login to get token
        const loginResponse = await axios.post('http://localhost:5000/api/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginResponse.data.token;
        
        // Get current data
        const [channelsResponse, downtimeResponse, usersResponse] = await Promise.all([
            axios.get('http://localhost:5000/api/channels', {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:5000/api/downtime', {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);
        
        console.log(`   📋 Channels: ${channelsResponse.data.length} configured`);
        console.log(`   ⏱️  Downtime Records: ${downtimeResponse.data.length} total`);
        console.log(`   👥 Users: ${usersResponse.data.length} registered`);
        
        // Show recent downtime
        if (downtimeResponse.data.length > 0) {
            console.log('\n📅 Recent Downtime Records:');
            const recent = downtimeResponse.data.slice(0, 3);
            recent.forEach((record, index) => {
                const date = new Date(record.start_time).toLocaleDateString();
                const time = new Date(record.start_time).toLocaleTimeString();
                console.log(`   ${index + 1}. ${record.channel_name} - ${record.downtime_type} (${record.duration_minutes} mins) - ${date} ${time}`);
            });
        }
        
    } catch (error) {
        console.log('   ❌ Unable to fetch current data');
    }
    
    console.log('\n🌐 Access Information:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000');
    console.log('   Login: admin / admin123');
    
    console.log('\n🚀 Quick Start Commands:');
    console.log('   Start both servers: ./start.sh');
    console.log('   Backend only: npm run server');
    console.log('   Frontend only: npm run dev');
    console.log('   Run demo: node demo.js');
}

checkStatus();