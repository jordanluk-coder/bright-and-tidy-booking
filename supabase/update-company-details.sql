-- ---------------------------------------------------------------------
--  Fix the company details shown on the website
-- ---------------------------------------------------------------------
--  The website reads the company name, phone, email and address from the
--  business_settings table, so whatever is stored there is what visitors see.
--  Run this in the Supabase SQL editor if the wrong details are showing.
--
--  The site uses the oldest row, so this updates every row to be safe.

update public.business_settings
set business_name  = 'Bright and Tidy Cleaning',
    business_phone = '(951) 593-8266';

-- Optional: add your email and service address when you are ready.
-- update public.business_settings
-- set business_email   = 'you@yourdomain.com',
--     business_address = '123 Main Street, Riverside, CA 92501';

-- Confirm what the website will now display:
select business_name, business_email, business_phone, business_address
from public.business_settings;
