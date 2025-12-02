-- public.budgets definition

-- Drop table

-- DROP TABLE public.budgets;

CREATE TABLE public.budgets (
	id serial4 NOT NULL,
	"year" int4 NOT NULL,
	maintenance_amount numeric(10, 2) NOT NULL,
	repair_amount numeric(10, 2) NOT NULL,
	total_amount numeric(10, 2) GENERATED ALWAYS AS ((maintenance_amount + repair_amount)) STORED NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT budgets_pkey PRIMARY KEY (id),
	CONSTRAINT budgets_year_key UNIQUE (year)
);


-- public.buildings definition

-- Drop table

-- DROP TABLE public.buildings;

CREATE TABLE public.buildings (
	id serial4 NOT NULL,
	"name" varchar(150) NOT NULL,
	address varchar(255) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT buildings_pkey PRIMARY KEY (id),
	CONSTRAINT unique_building UNIQUE (name, address)
);


-- public.maintenance_services definition

-- Drop table

-- DROP TABLE public.maintenance_services;

CREATE TABLE public.maintenance_services (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	provider varchar(255) NOT NULL,
	monthly_cost numeric(10, 2) NOT NULL,
	start_date date NOT NULL,
	end_date date NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT maintenance_services_pkey PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id serial4 NOT NULL,
	full_name varchar(150) NOT NULL,
	email varchar(150) NOT NULL,
	"password" varchar(200) NOT NULL,
	"role" varchar(50) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);


-- public.units definition

-- Drop table

-- DROP TABLE public.units;

CREATE TABLE public.units (
	id serial4 NOT NULL,
	building_id int4 NOT NULL,
	unit_number varchar(50) NOT NULL,
	floor int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT unique_unit_per_building UNIQUE (building_id, unit_number),
	CONSTRAINT units_pkey PRIMARY KEY (id),
	CONSTRAINT fk_units_building FOREIGN KEY (building_id) REFERENCES public.buildings(id) ON DELETE CASCADE
);


-- public.votes_polls definition

-- Drop table

-- DROP TABLE public.votes_polls;

CREATE TABLE public.votes_polls (
	id serial4 NOT NULL,
	title varchar(255) NOT NULL,
	description text NULL,
	start_at timestamp NOT NULL,
	end_at timestamp NOT NULL,
	created_by int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	status varchar(20) DEFAULT 'ACTIVE'::character varying NULL,
	CONSTRAINT votes_polls_pkey PRIMARY KEY (id),
	CONSTRAINT votes_polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);


-- public.unit_fees definition

-- Drop table

-- DROP TABLE public.unit_fees;

CREATE TABLE public.unit_fees (
	id serial4 NOT NULL,
	unit_id int4 NOT NULL,
	"month" date NOT NULL,
	amount numeric(10, 2) NOT NULL,
	due_from date NOT NULL,
	due_to date NOT NULL,
	is_paid bool DEFAULT false NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT unique_unit_month UNIQUE (unit_id, month),
	CONSTRAINT unit_fees_pkey PRIMARY KEY (id),
	CONSTRAINT unit_fees_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE
);


-- public.votes_options definition

-- Drop table

-- DROP TABLE public.votes_options;

CREATE TABLE public.votes_options (
	id serial4 NOT NULL,
	poll_id int4 NOT NULL,
	option_text varchar(255) NOT NULL,
	CONSTRAINT votes_options_pkey PRIMARY KEY (id),
	CONSTRAINT votes_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.votes_polls(id) ON DELETE CASCADE
);


-- public.payments definition

-- Drop table

-- DROP TABLE public.payments;

CREATE TABLE public.payments (
	id serial4 NOT NULL,
	unit_fee_id int4 NOT NULL,
	user_id int4 NULL,
	amount numeric(10, 2) NOT NULL,
	payment_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	bank_reference varchar(255) NOT NULL,
	status varchar(20) DEFAULT 'COMPLETED'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT payments_bank_reference_key UNIQUE (bank_reference),
	CONSTRAINT payments_pkey PRIMARY KEY (id),
	CONSTRAINT payments_unit_fee_id_fkey FOREIGN KEY (unit_fee_id) REFERENCES public.unit_fees(id) ON DELETE CASCADE,
	CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);


-- public.receipts definition

-- Drop table

-- DROP TABLE public.receipts;

CREATE TABLE public.receipts (
	id serial4 NOT NULL,
	payment_id int4 NOT NULL,
	receipt_number varchar(100) NOT NULL,
	generated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	pdf_url varchar(255) NULL,
	CONSTRAINT receipts_pkey PRIMARY KEY (id),
	CONSTRAINT receipts_receipt_number_key UNIQUE (receipt_number),
	CONSTRAINT receipts_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE
);


-- public.user_votes definition

-- Drop table

-- DROP TABLE public.user_votes;

CREATE TABLE public.user_votes (
	id serial4 NOT NULL,
	poll_id int4 NOT NULL,
	option_id int4 NOT NULL,
	user_id int4 NOT NULL,
	voted_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT user_votes_pkey PRIMARY KEY (id),
	CONSTRAINT user_votes_poll_id_user_id_key UNIQUE (poll_id, user_id),
	CONSTRAINT user_votes_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.votes_options(id) ON DELETE CASCADE,
	CONSTRAINT user_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.votes_polls(id) ON DELETE CASCADE,
	CONSTRAINT user_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);