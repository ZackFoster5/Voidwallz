-- Add a sequence for the ticket ID
CREATE SEQUENCE IF NOT EXISTS support_tickets_id_seq;

-- Add the ticket_id column to the support_tickets table
ALTER TABLE support_tickets
ADD COLUMN ticket_id TEXT;

-- Create a function to generate the unique ticket ID
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_id := 'VW-' || nextval('support_tickets_id_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert
CREATE TRIGGER set_ticket_id
BEFORE INSERT ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_id();
