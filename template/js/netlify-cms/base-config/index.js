import getSections from '@ecomplus/storefront-template/template/js/netlify-cms/base-config/sections'
import getSettings from '@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/settings'
import getLayout from '@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/layout'
import getPages from '@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/pages'
import getBlogPosts from '@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/blog-posts'
import getExtraPages from '@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/extra-pages'
import getWidgets from '@ecomplus/storefront-template/template/js/netlify-cms/base-config/collections/widgets'

export default options => {
  const sections = getSections(options)
  const bannersGrid = sections.find(el => el.name === 'banners-grid')
  bannersGrid.fields[0].fields.push({
    label: "Título do Banner",
    name: "bn_title",
    widget: "text",
    required:false
  });
 
  bannersGrid.fields.push({
    label: "Título da Sessão",
    name: "title",
    widget: "text",
    required:false
  });
  bannersGrid.fields.push(
    {
      label: 'Tipo de grade',
      required: false,
      name: 'grid_type',
      hint: '',
      widget: 'select',
      default: 'Comum',
      options: ['Comum', 'Mosaico','Grupo']
    }
  )
  const collectionShelf = sections.find(el => el.name === 'collection-shelf')
  if (collectionShelf && Array.isArray(collectionShelf.fields)) {
    collectionShelf.fields.push({
      label: 'Tipo de estante',
      required: false,
      name: 'grid_type',
      hint: 'Selecione o tipo de estante que deseja exibir. Mosaico não suporta carrossel de produtos e Horizontal mantem duas linhas de produtos com cards no formato paisagem',
      widget: 'select',
      default: 'Comum',
      options: ['Comum', 'Mosaico', 'Horizontal']
    })
    collectionShelf.fields.push({
          label: "Cor do Título",
          name: "title_color",
          widget: "color",
          required:false
        },)
    collectionShelf.fields.push({
          required: false,
          label: "Cor do Fundo",
          name: "bg_color",
          widget: "color"
        },)
  }

  options.sections = sections

  return {
    backend: {
      name: 'git-gateway',
      branch: 'master',
      commit_messages: {
        create: 'Create {{collection}} “{{slug}}”',
        update: 'Update {{collection}} “{{slug}}”',
        delete: 'Delete {{collection}} “{{slug}}”',
        uploadMedia: 'Upload “{{path}}”',
        deleteMedia: '[skip ci] Delete “{{path}}”',
        openAuthoring: '{{message}}'
      }
    },
    logo_url: 'https://ecom.nyc3.digitaloceanspaces.com/storefront/cms.png',
    locale: 'pt',
    load_config_file: Boolean(window.CMS_LOAD_CONFIG_FILE),
    media_folder: `${options.baseDir}template/public/img/uploads`,
    public_folder: '/img/uploads',
    slug: {
      encoding: 'ascii',
      clean_accents: true,
      sanitize_replacement: '-'
    },
    collections: [
      getSettings(options),
      getLayout(options),
      getPages(options),
      getBlogPosts(options),
      getExtraPages(options),
      getWidgets(options),
      {
        label: "[alpix.dev]",
        name: "alpix",
        editor: {
            preview: false
        },
        files: [
           {
              name: "latest_menu",
              label: "Menu Rodapé",
              file: "content/apx_latest_menu.json",
              fields: [
                  {
                    label: "Itens",
                    name: "latest_menu",
                    widget: "list",
                    required: false,
                    fields: [
                        {
                            label: "Texto/Título",
                            name: "title",
                            widget: "string"
                        },
                        {
                            label: "URL de destino",
                            name: "url",
                            widget: "string"
                        }
                    ]
                }         
              ]
          },
          {
              name: "newsletter",
              label: "Newsletter",
              file: "content/apx_newsletter.json",
              editor: {
                  preview: false
              },
              fields: [
                  {
                      label: "Título",
                      name: "title",
                      widget: "string"
                  },
                  {
                      label: "Texto",
                      name: "description",
                      widget: "string"
                  }                          
              ]
          },
          {
              name: "header_colors",
              label: "Cabeçalho",
              file: "content/apx_header_colors.json",
              editor: {
                  preview: false
              },
              fields: [
                {
                      label: "Cor da Linha Divisória",
                      name: "border_menu_color",
                      widget: "color",
                      required: false,
                      hint: "Selecione a cor da linha que separa o cabeçalho do menu"
                  },
                  {
                      label: "Cor do Fundo",
                      name: "bg_color",
                      widget: "color",
                      required: false,
                      hint: "Selecione a cor de fundo do cabeçalho"
                  },
                  {
                      label: "Cor dos Textos",
                      name: "text_color",
                      widget: "color",
                      required: false,
                      hint: "Selecione a cor dos textos do cabeçalho"
                  },
                  {
                      label: "Cor do Menu",
                      name: "menu_color",
                      widget: "color",
                      required: false,
                      hint: "Selecione a cor do menu de navegação"
                  },
                  {
                      label: "Categorias Principais",
                      name: "categories",
                      widget: "list",
                      required: false,
                      hint: "Adicione as categorias principais que aparecerão no menu",
                      fields: [
                          {
                              label: "Título da Categoria",
                              name: "title",
                              widget: "string",
                              required: true,
                              hint: "Digite o nome da categoria principal"
                          }
                      ]
                  }
              ]
          },
        ]
      }        
    ]
  }
}
