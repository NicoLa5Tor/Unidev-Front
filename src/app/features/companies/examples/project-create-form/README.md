# Project Create Form Examples

Ejemplos listos para llenar el formulario de creacion de proyectos en el panel de empresa.

## Campos cubiertos

- `name`
- `businessObjective`
- `targetUsers`
- `mainModules`
- `integrations`
- `platforms`
- `deliveryDeadline`
- `technicalConstraints`
- `description`
- `budgetAmount`
- `developmentTypeSuggestedCode`
- `developmentTypeSuggestedLabel`

## Nota sobre el tipo de desarrollo

No se guarda `developmentTypeId` porque ese valor depende de la base de datos de cada entorno.
Por eso cada ejemplo trae:

- `developmentTypeSuggestedCode`
- `developmentTypeSuggestedLabel`

Usa ese valor como guia para escoger la opcion correcta en el `select`.

## Catalogo

Revisa [index.json](/home/nicolas/Escritorio/Unidev/UnidevFront/src/app/features/companies/examples/project-create-form/index.json) para ver todos los ejemplos disponibles.
