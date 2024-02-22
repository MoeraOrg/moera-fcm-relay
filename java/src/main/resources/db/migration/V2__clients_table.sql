CREATE TABLE clients (
    id uuid NOT NULL PRIMARY KEY,
    client_id varchar(256) NOT NULL,
    node_name varchar(128) NOT NULL,
    lang varchar(8),
    created_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX clients_client_id_idx ON clients(client_id);
CREATE INDEX clients_node_name_idx ON clients(node_name);
