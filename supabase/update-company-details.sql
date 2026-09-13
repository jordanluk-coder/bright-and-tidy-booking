-- ---------------------------------------------------------------------
--  Fix the company details shown on the website
-- ---------------------------------------------------------------------
--  The website reads the company name, phone, email and address from the
--  business_settings table, so whatever is stored there is what visitors see.
--  Run this in the Supabase SQL editor if the wrong details are showing.
--
--  The site uses the oldest row, so this updates every row to be safe.
--  The address is cleared on purpose: the website publishes phone and email only.

update public.business_settings
set business_name    = 'Bright and Tidy Cleaning',
    business_phone   = '(951) 593-8266',
    business_email   = 'info@brightandtidyco.com',
    business_address = '';

-- Confirm what the website will now display:
select business_name, business_email, business_phone, business_address
from public.business_settings;
