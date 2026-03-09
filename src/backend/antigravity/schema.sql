-- schema.sql

CREATE TABLE IF NOT EXISTS Sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS FlowLogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES Sensors(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS SystemAlerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
