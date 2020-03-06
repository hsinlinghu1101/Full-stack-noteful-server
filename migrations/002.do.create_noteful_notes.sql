CREATE TABLE notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    notes_name TEXT NOT NULL,
    modified TIMESTAMP DEFAULT now() NOT NULL ,
    content TEXT NOT NULL,
    folders_id INTEGER REFERENCES folders(id) ON DELETE CASCADE NOT NULL
);