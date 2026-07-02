/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.createTable('custom_filter', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();

    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();
    table.text('color').notNullable();
    table.jsonb('label_ids').notNullable().defaultTo('[]');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('position');
  });
};

module.exports.down = (knex) => knex.schema.dropTable('custom_filter');
