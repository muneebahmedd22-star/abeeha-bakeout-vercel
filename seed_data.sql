-- 1. Seed existing reviews into reviews table
INSERT INTO reviews (name, city, stars, approved, text) VALUES
('Ayesha Malik', 'Lahore', 5, true, 'Ordered a custom birthday cake — it looked exactly like I described. Everyone at the party loved it.'),
('Sana Tariq', 'Lahore', 5, true, 'Bohot acha cake tha yaar, red velvet liya tha — taste bilkul fresh tha aur delivery bhi time pe thi. Definitely order karungi dobara.'),
('Usman Ahmed', 'Lahore', 5, true, 'Got the chocolate fudge cake for my wife''s birthday. She was really happy. Great taste and great design.'),
('Mahnoor Baig', 'Lahore', 5, true, '2-tier cake order ki thi engagement ke liye — wallah itni sundar thi ke sab ne photos li. Taste bhi mast tha.'),
('Zainab Raza', 'Lahore', 4, true, 'The butterfly cake was exactly what I wanted for my daughter. Very creative and the cream was light and fresh.'),
('Hamza Qureshi', 'Lahore', 5, true, 'Brownie pack mangwaya tha — yaar seriously itna acha tha. Fudgy, rich, not too sweet. Har hafte order karna chahta hun.'),
('Nadia Hussain', 'Lahore', 5, true, 'Ordered a custom theme cake for my son''s birthday. The fondant figures were so detailed. Loved every bit of it.'),
('Bilal Chaudhry', 'Lahore', 5, true, 'KitKat drip cake liya tha — presentation ekdum pro level thi. 2 din pehle order diya aur time pe aa gaya.'),
('Fatima Iqbal', 'Lahore', 5, true, 'Cupcakes office event ke liye order ki thin — sab ne puchha kahan se li hain. Taste aur presentation dono perfect.'),
('Rimsha Khan', 'Lahore', 5, true, 'Caramel cake and brownie pack together — both were so fresh and well-packed. Very happy with the whole experience.'),
('Ali Hassan', 'Lahore', 5, true, 'Ammi ne order ki thi floral tier cake — quality dekh ke genuinely surprised hua. Bohot professional kaam tha.'),
('Hira Nawaz', 'Lahore', 5, true, 'Honest review — taste real mein acha hai aur design bilkul waisa aaya jaise DM pe discuss kiya tha. Koi complaint nahi.'),
('Urooj Fatima', 'Lahore', 5, true, 'Pineapple cake liya tha — itna light aur fresh tha ke ghar wale sab khush ho gaye. Packaging bhi neat thi.'),
('Amna Shahid', 'Lahore', 5, true, 'Ordered a sheep-shaped cake for Eid — it was absolutely adorable and tasted amazing. Will definitely order again!'),
('Saad Mirza', 'Lahore', 5, true, 'Bhai ne recommend kiya tha — pehli baar order kiya walmond fudge cake. Sach mein best decision tha. Cream bilkul perfect thi.'),
('Kiran Aslam', 'Lahore', 5, true, 'Chocolate cupcakes mangwaye the — pack of 6 liye the aur sab khatam bhi ho gaye 10 minute mein. Next time zyada lungi.'),
('Tooba Arshad', 'Lahore', 5, true, 'Got a graduation cake made — the Squidward design was hilarious and perfect. Everyone at the party was impressed.'),
('Omar Farooq', 'Lahore', 4, true, 'Good quality aur reasonable prices. Vanilla cake ordered — ghar pe sab ko pasand aaya. Thoda aur decoration hota toh 5 star deta.'),
('Laiba Yousaf', 'Lahore', 5, true, 'Oreo chocolate drip cake — I have no words. It was stunning and tasted even better than it looked. 10/10 recommend.'),
('Dua Rehman', 'Lahore', 5, true, 'Meri ammi ki birthday thi — special message wali cake order ki. Unki aankhein bhar aa gai dekh ke. Thank you Abeeha''s Bakeout!');

-- 2. Seed existing gallery images into gallery table (using relative paths)
INSERT INTO gallery (src, caption) VALUES
('/images/html_img_2_2.jpeg', 'Pink Butterfly Cake'),
('/images/html_img_3_3.jpeg', 'Maa — With Love'),
('/images/html_img_4_4.jpeg', 'Cute Lamb Cake'),
('/images/html_img_8_8.jpeg', 'Graduation Cake'),
('/images/html_img_9_9.jpeg', 'Custom Story Cake'),
('/images/html_img_10_10.jpeg', 'Abdulwasay Birthday Cake'),
('/images/html_img_11_11.jpeg', 'KitKat Chocolate Drip Cake'),
('/images/html_img_12_12.jpeg', '2-Tier Floral Cake'),
('/images/html_img_13_13.jpeg', 'Hello Kitty 1st Birthday Cake'),
('/images/html_img_14_14.jpeg', 'Cute Bunny Roses Cake'),
('/images/html_img_15_15.jpeg', 'Chocolate Heart Curls Cake'),
('/images/html_img_16_16.jpeg', 'Happy Anniversary Cupcakes'),
('/images/html_img_17_17.jpeg', 'Lightning McQueen Car Cake');
