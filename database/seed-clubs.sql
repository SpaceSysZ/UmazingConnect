-- Seed Data for Berkeley High School Clubs
-- Run this in Supabase SQL Editor to populate your database with sample clubs

-- Insert sample clubs
INSERT INTO clubs (name, description, category, meeting_time, location, is_claimed, image_url) VALUES
-- Academic Clubs
('Debate Club', 'Sharpen your argumentation and public speaking skills through competitive debates on current events and philosophical topics.', 'academic', 'Tuesdays 3:30 PM', 'Room 204', false, null),
('Math Club', 'Explore advanced mathematics, prepare for competitions, and solve challenging problems together.', 'academic', 'Thursdays 3:30 PM', 'Room 301', false, null),
('Science Olympiad', 'Compete in regional and national science competitions across biology, chemistry, physics, and engineering.', 'academic', 'Wednesdays 3:30 PM', 'Science Lab', false, null),
('Model UN', 'Simulate United Nations conferences, debate global issues, and develop diplomacy skills.', 'academic', 'Mondays 3:30 PM', 'Room 105', false, null),
('Robotics Club', 'Design, build, and program robots for competitions. Learn engineering and coding skills.', 'technology', 'Tuesdays & Thursdays 3:30 PM', 'Tech Lab', false, null),
('Academic Decathlon', 'Prepare for the Academic Decathlon competition across 10 subjects including art, music, and science.', 'academic', 'Fridays 3:30 PM', 'Library', false, null),

-- Arts Clubs
('Drama Club', 'Perform in school plays, musicals, and theatrical productions. All experience levels welcome!', 'arts', 'Mondays & Wednesdays 3:30 PM', 'Auditorium', false, null),
('Art Club', 'Express yourself through painting, drawing, sculpture, and mixed media. Showcase your work in exhibitions.', 'arts', 'Thursdays 3:30 PM', 'Art Room', false, null),
('Photography Club', 'Learn photography techniques, digital editing, and visual storytelling. Participate in photo contests.', 'arts', 'Wednesdays 3:30 PM', 'Media Center', false, null),
('Creative Writing Club', 'Share your stories, poetry, and creative works. Publish in our literary magazine.', 'arts', 'Tuesdays 3:30 PM', 'Room 210', false, null),
('Film Club', 'Create short films, documentaries, and video projects. Learn cinematography and editing.', 'arts', 'Fridays 3:30 PM', 'Media Lab', false, null),
('Music Production Club', 'Produce beats, mix tracks, and learn music production software. Collaborate on projects.', 'arts', 'Thursdays 3:30 PM', 'Music Room', false, null),

-- Sports & Recreation
('Basketball Club', 'Play pickup games, improve your skills, and compete in intramural tournaments.', 'sports', 'Tuesdays & Thursdays 4:00 PM', 'Gymnasium', false, null),
('Soccer Club', 'Recreational soccer for all skill levels. Practice drills and friendly matches.', 'sports', 'Mondays & Wednesdays 4:00 PM', 'Field', false, null),
('Yoga & Wellness Club', 'Practice yoga, meditation, and mindfulness. Focus on mental and physical health.', 'sports', 'Wednesdays 3:30 PM', 'Dance Studio', false, null),
('Ultimate Frisbee Club', 'Learn and play ultimate frisbee. Fun, fast-paced team sport for everyone.', 'sports', 'Fridays 4:00 PM', 'Field', false, null),
('Running Club', 'Train together, participate in local races, and build endurance. All paces welcome.', 'sports', 'Tuesdays & Thursdays 3:30 PM', 'Track', false, null),

-- Technology Clubs
('Coding Club', 'Learn programming languages, build apps and websites, and participate in hackathons.', 'technology', 'Wednesdays 3:30 PM', 'Computer Lab', false, null),
('Cybersecurity Club', 'Learn about network security, ethical hacking, and digital privacy. Compete in CTF challenges.', 'technology', 'Thursdays 3:30 PM', 'Tech Lab', false, null),
('Game Development Club', 'Create video games using Unity, Unreal Engine, and other tools. Design and code your own games.', 'technology', 'Fridays 3:30 PM', 'Computer Lab', false, null),
('Web Design Club', 'Learn HTML, CSS, JavaScript, and modern web frameworks. Build beautiful websites.', 'technology', 'Mondays 3:30 PM', 'Computer Lab', false, null),

-- Service & Community
('Key Club', 'Volunteer in the community, organize service projects, and make a positive impact.', 'service', 'Tuesdays 3:30 PM', 'Room 115', false, null),
('Environmental Club', 'Promote sustainability, organize campus cleanups, and advocate for environmental causes.', 'service', 'Thursdays 3:30 PM', 'Room 220', false, null),
('Peer Tutoring', 'Help fellow students succeed academically. Tutor in various subjects and build leadership skills.', 'service', 'Flexible Schedule', 'Library', false, null),
('Red Cross Club', 'Learn first aid, organize blood drives, and respond to community emergencies.', 'service', 'Wednesdays 3:30 PM', 'Room 108', false, null),
('Habitat for Humanity', 'Build homes for families in need. Participate in local construction projects and fundraisers.', 'service', 'Saturdays (Monthly)', 'Off-Campus', false, null),

-- Hobby & Interest
('Chess Club', 'Play chess, learn strategies, and compete in tournaments. All skill levels welcome.', 'hobby', 'Thursdays 3:30 PM', 'Room 312', false, null),
('Anime Club', 'Watch and discuss anime, manga, and Japanese culture. Attend conventions and cosplay events.', 'hobby', 'Fridays 3:30 PM', 'Room 205', false, null),
('Board Games Club', 'Play strategy games, card games, and tabletop RPGs. Discover new games and make friends.', 'hobby', 'Wednesdays 3:30 PM', 'Room 118', false, null),
('Cooking Club', 'Learn to cook diverse cuisines, share recipes, and enjoy delicious food together.', 'hobby', 'Tuesdays 3:30 PM', 'Culinary Lab', false, null),
('Book Club', 'Read and discuss contemporary and classic literature. Share your love of reading.', 'hobby', 'Mondays 3:30 PM', 'Library', false, null),
('Gardening Club', 'Maintain the school garden, grow vegetables and flowers, and learn about sustainable agriculture.', 'hobby', 'Thursdays 3:30 PM', 'School Garden', false, null),

-- Cultural & Identity
('Black Student Union', 'Celebrate Black culture, history, and achievement. Organize events and advocate for equity.', 'service', 'Wednesdays 3:30 PM', 'Room 125', false, null),
('Asian Pacific Islander Club', 'Explore API cultures, traditions, and contemporary issues. Build community and awareness.', 'service', 'Thursdays 3:30 PM', 'Room 130', false, null),
('Latinx Student Union', 'Celebrate Latinx heritage, culture, and identity. Organize cultural events and support students.', 'service', 'Tuesdays 3:30 PM', 'Room 135', false, null),
('LGBTQ+ Alliance', 'Create a safe, supportive space for LGBTQ+ students and allies. Advocate for inclusion and equality.', 'service', 'Mondays 3:30 PM', 'Room 140', false, null),

-- Special Interest
('Yearbook Committee', 'Design and produce the school yearbook. Photography, layout design, and writing opportunities.', 'arts', 'Tuesdays & Thursdays 3:30 PM', 'Room 215', false, null),
('Student Government', 'Represent the student body, organize school events, and advocate for student interests.', 'service', 'Fridays 3:30 PM', 'Conference Room', false, null),
('Journalism Club', 'Write for the school newspaper, report on campus news, and develop journalism skills.', 'arts', 'Wednesdays 3:30 PM', 'Room 218', false, null),
('Entrepreneurship Club', 'Learn business skills, develop startup ideas, and compete in business plan competitions.', 'academic', 'Thursdays 3:30 PM', 'Room 305', false, null)

ON CONFLICT (name) DO NOTHING;

-- Add some sample tags for clubs
INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['competitive', 'public-speaking', 'leadership']) 
FROM clubs WHERE name = 'Debate Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['stem', 'competition', 'problem-solving']) 
FROM clubs WHERE name = 'Math Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['stem', 'engineering', 'programming', 'competition']) 
FROM clubs WHERE name = 'Robotics Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['performing-arts', 'theater', 'creative']) 
FROM clubs WHERE name = 'Drama Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['visual-arts', 'creative', 'exhibition']) 
FROM clubs WHERE name = 'Art Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['coding', 'web-dev', 'hackathon', 'stem']) 
FROM clubs WHERE name = 'Coding Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['volunteer', 'community-service', 'leadership']) 
FROM clubs WHERE name = 'Key Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['sustainability', 'activism', 'volunteer']) 
FROM clubs WHERE name = 'Environmental Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['strategy', 'competition', 'casual']) 
FROM clubs WHERE name = 'Chess Club'
ON CONFLICT DO NOTHING;

INSERT INTO club_tags (club_id, tag) 
SELECT id, unnest(ARRAY['cultural', 'diversity', 'advocacy']) 
FROM clubs WHERE name = 'Black Student Union'
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
    category,
    COUNT(*) as club_count
FROM clubs
GROUP BY category
ORDER BY category;

-- Show all clubs
SELECT 
    name,
    category,
    meeting_time,
    location
FROM clubs
ORDER BY category, name;
