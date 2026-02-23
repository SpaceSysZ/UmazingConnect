import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://your-staging-branch.vercel.app';

// Simulate realistic user behavior
export const options = {
  scenarios: {
    // Peak: 600 users hitting at once
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },   // Ramp up
        { duration: '5m', target: 600 },   // Peak
        { duration: '2m', target: 0 },     // Ramp down
      ],
    },
    // Sustained: 600 users for 30 minutes
    sustained_load: {
      executor: 'constant-vus',
      vus: 600,
      duration: '30m',
      startTime: '10m', // after peak test
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],     // Less than 5% errors
  },
};

// Test data - fake user profiles for DB operations
const testUsers = [
  { email: 'testuser1@berkeleyprep.org', name: 'Test User 1' },
  { email: 'testuser2@berkeleyprep.org', name: 'Test User 2' },
  // Add ~20 rotating test users to avoid conflicts
];

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  const headers = {
    'Content-Type': 'application/json',
    'x-load-test': 'true',  // Your bypass header
  };

  // Most common user flow: view clubs
  let res = http.get(`${BASE_URL}/api/clubs`, { headers });
  check(res, { 'clubs list 200': (r) => r.status === 200 });
  sleep(1);

  // View a specific club
  res = http.get(`${BASE_URL}/api/clubs/1`, { headers });
  check(res, { 'club detail 200': (r) => r.status === 200 });
  sleep(0.5);

  // Feed
  res = http.get(`${BASE_URL}/api/feed`, { headers });
  check(res, { 'feed 200': (r) => r.status === 200 });
  sleep(2);

  // Notifications check
  res = http.get(`${BASE_URL}/api/notifications?userId=${user.email}`, { headers });
  sleep(1);
}
