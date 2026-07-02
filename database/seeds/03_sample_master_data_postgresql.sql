-- Optional development-only master data for local testing.
-- Run this only after 02_medico_legal_schema_postgresql.sql.

BEGIN;

INSERT INTO hospital (hospital_name, district, address)
VALUES ('Teaching Hospital Peradeniya', 'Kandy', 'Peradeniya, Sri Lanka')
ON CONFLICT DO NOTHING;

INSERT INTO jmo_office (office_name, hospital_id, district, contact_no)
SELECT
    'JMO Office - Teaching Hospital Peradeniya',
    h.hospital_id,
    'Kandy',
    '081-0000000'
FROM hospital h
WHERE h.hospital_name = 'Teaching Hospital Peradeniya'
  AND h.district = 'Kandy'
  AND NOT EXISTS (
      SELECT 1
      FROM jmo_office jo
      WHERE jo.office_name = 'JMO Office - Teaching Hospital Peradeniya'
  );

INSERT INTO doctor
    (full_name, designation, slmc_reg_no, contact_no, current_office_id, employment_status)
SELECT
    'Dr. Sampath Jayasena',
    'Consultant Judicial Medical Officer',
    'SLMC-00001',
    '077-0000000',
    jo.jmo_office_id,
    'Active'
FROM jmo_office jo
WHERE jo.office_name = 'JMO Office - Teaching Hospital Peradeniya'
  AND NOT EXISTS (
      SELECT 1 FROM doctor WHERE slmc_reg_no = 'SLMC-00001'
  );

INSERT INTO police_station (station_name, division, district, contact_no)
VALUES ('Peradeniya Police Station', 'Kandy Division', 'Kandy', '081-0000001')
ON CONFLICT (station_name, district) DO NOTHING;

INSERT INTO court (court_name, district, address)
VALUES ('Magistrate Court Kandy', 'Kandy', 'Kandy, Sri Lanka')
ON CONFLICT (court_name, district) DO NOTHING;

INSERT INTO laboratory (laboratory_name, location, contact_no)
SELECT 'Government Analyst Laboratory', 'Colombo', '011-0000000'
WHERE NOT EXISTS (
    SELECT 1 FROM laboratory
    WHERE laboratory_name = 'Government Analyst Laboratory'
      AND location = 'Colombo'
);

COMMIT;
