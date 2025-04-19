-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  city TEXT NOT NULL,
  state TEXT,
  "postalCode" TEXT,
  country TEXT NOT NULL,
  phone TEXT,
  "isDefault" BOOLEAN DEFAULT FALSE,
  label TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Also add defaultShippingAddressId column to users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name='users' AND column_name='defaultShippingAddressId'
  ) THEN
    ALTER TABLE users ADD COLUMN "defaultShippingAddressId" INTEGER REFERENCES addresses(id) ON DELETE SET NULL;
  END IF;
END $$;