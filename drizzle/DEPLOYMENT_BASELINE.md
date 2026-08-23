# Production migration baseline

The live SpaPlus Global database already contains the schema represented by migrations 0000 through 0007, but its hosted migration ledger was initialized after those tables were created. Production packaging therefore starts with the pending migration 0008 only. Historical migrations remain in this repository for schema provenance and local development.
