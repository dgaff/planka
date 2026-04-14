/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.boolean('keep_open_after_card_create').notNullable().defaultTo(true);
  });

  return knex.schema.alterTable('board', (table) => {
    table.boolean('keep_open_after_card_create').notNullable().alter();
  });
};

exports.down = (knex) =>
  knex.schema.table('board', (table) => {
    table.dropColumn('keep_open_after_card_create');
  });
