ALTER TABLE "Client"
  ADD COLUMN "businessEmail" TEXT,
  ADD COLUMN "website" TEXT;

UPDATE "Client"
SET
  "phone" = CASE
    WHEN "phone" IS NULL OR btrim("phone") = '' THEN NULL
    WHEN regexp_replace("phone", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("phone", '\D', '', 'g')
    WHEN regexp_replace("phone", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("phone", '\D', '', 'g')
    ELSE btrim("phone")
  END,
  "mobile" = CASE
    WHEN "mobile" IS NULL OR btrim("mobile") = '' THEN NULL
    WHEN regexp_replace("mobile", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("mobile", '\D', '', 'g')
    WHEN regexp_replace("mobile", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("mobile", '\D', '', 'g')
    ELSE btrim("mobile")
  END,
  "whatsapp" = CASE
    WHEN "whatsapp" IS NULL OR btrim("whatsapp") = '' THEN NULL
    WHEN regexp_replace("whatsapp", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("whatsapp", '\D', '', 'g')
    WHEN regexp_replace("whatsapp", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("whatsapp", '\D', '', 'g')
    ELSE btrim("whatsapp")
  END,
  "primaryContactPhone" = CASE
    WHEN "primaryContactPhone" IS NULL OR btrim("primaryContactPhone") = '' THEN NULL
    WHEN regexp_replace("primaryContactPhone", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("primaryContactPhone", '\D', '', 'g')
    WHEN regexp_replace("primaryContactPhone", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("primaryContactPhone", '\D', '', 'g')
    ELSE btrim("primaryContactPhone")
  END;

UPDATE "ClientLocation"
SET "phone" = CASE
  WHEN "phone" IS NULL OR btrim("phone") = '' THEN NULL
  WHEN regexp_replace("phone", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("phone", '\D', '', 'g')
  WHEN regexp_replace("phone", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("phone", '\D', '', 'g')
  ELSE btrim("phone")
END;

UPDATE "ClientEmployee"
SET
  "phone" = CASE
    WHEN "phone" IS NULL OR btrim("phone") = '' THEN NULL
    WHEN regexp_replace("phone", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("phone", '\D', '', 'g')
    WHEN regexp_replace("phone", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("phone", '\D', '', 'g')
    ELSE btrim("phone")
  END,
  "mobile" = CASE
    WHEN "mobile" IS NULL OR btrim("mobile") = '' THEN NULL
    WHEN regexp_replace("mobile", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("mobile", '\D', '', 'g')
    WHEN regexp_replace("mobile", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("mobile", '\D', '', 'g')
    ELSE btrim("mobile")
  END,
  "whatsapp" = CASE
    WHEN "whatsapp" IS NULL OR btrim("whatsapp") = '' THEN NULL
    WHEN regexp_replace("whatsapp", '\D', '', 'g') ~ '^\d{10}$' THEN '+1' || regexp_replace("whatsapp", '\D', '', 'g')
    WHEN regexp_replace("whatsapp", '\D', '', 'g') ~ '^1\d{10}$' THEN '+' || regexp_replace("whatsapp", '\D', '', 'g')
    ELSE btrim("whatsapp")
  END;
