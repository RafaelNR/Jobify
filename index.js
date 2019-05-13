const express = require('express')
const app = express()

// Banco de Dados
const sqlite = require('sqlite');
const dbConnection = sqlite.open('banco.sqlite', { Promise })

const parser = require('body-parser')

const port = process.env.PORT || 3000

// User sistema de views 
app.set('view engine', 'ejs')

// Caso não encontre a rota, pesquisa na pasta public
app.use(express.static('public'))
// Body Parser
app.use(parser.urlencoded({extended: true}))

// Rotas de Acesso
app.get('/', async (request, response) => {
    const db = await dbConnection;
    const CategoriasDB = await db.all('SELECT * FROM `categorias`;')
    const Vagas = await db.all('SELECT * FROM `vagas`;')
    const Number = await db.all('SELECT count(id) as number FROM `vagas`;')
    const Categorias = CategoriasDB.map(categoria => {
        return {
            ...categoria,
            vagas: Vagas.filter(vaga => vaga.categoria === categoria.id )
        }
    })
    response.render('home',{ Categorias, Number });
})

app.get('/vaga/open/:id', async (request, response) => {
    const db = await dbConnection;
    const Vaga = await db.get(`SELECT * FROM vagas WHERE id = ${request.params.id};`)
    response.render('./vagas/open', { Vaga });
})


app.get('/admin/home', (request, response) => {
    response.render('./admin/home');
})

app.get('/admin/categorias', async(request, response) => {
    const db = await dbConnection;
    const Categorias = await db.all('SELECT * FROM `categorias`;')
    response.render('./admin/categorias',{
        Categorias
    });
})

app.get('/admin/categorias/nova', async(request,response) => {
    response.render('./admin/categorias/nova')
})

app.post('/admin/categorias/nova', async(request,response) => {
    const db = await dbConnection;
    const { categoria } = request.body
    await db.run(`INSERT INTO categorias(categoria) VALUES('${categoria}')`)
    response.redirect('/admin/categorias')
})

app.get('/admin/categorias/excluir/:id', async(request, response) => {
    const db = await dbConnection;
    await db.run(`DELETE FROM categorias WHERE id = ${request.params.id};`)
    response.redirect('/admin/categorias')
})


app.get('/admin/vagas', async(request, response) => {
    const db = await dbConnection;
    const Vagas = await db.all('SELECT vagas.id,categorias.categoria,titulo,descricao FROM vagas,categorias WHERE vagas.categoria = categorias.id;')
    response.render('./admin/vagas', {
        Vagas
    });
})
app.get('/admin/vagas/excluir/:id', async(request, response) => {
    const db = await dbConnection;
    await db.run(`DELETE FROM vagas WHERE id = ${request.params.id};`)
    response.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async(request,response) => {
    const db = await dbConnection;
    const Categorias = await db.all('SELECT * FROM `categorias`;')
    response.render('./admin/vagas/nova',{
        Categorias
    })
})

app.post('/admin/vagas/nova', async(request,response) => {
    const db = await dbConnection;
    const {titulo, descricao, categoria } = request.body;
    await db.run(`INSERT INTO vagas(categoria,titulo,descricao,createAt) VALUES('${categoria}','${titulo}','${descricao}', '2019-05-01 00:00:00')`)
    response.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(request,response) => {
    const db = await dbConnection;
    const id = request.params.id;
    const Vaga = await db.get(`SELECT * FROM vagas WHERE id = ${id};`)
    const Categorias = await db.all('SELECT * FROM `categorias`;')
    console.log(Vaga)
    response.render('./admin/vagas/editar',{
        Vaga, Categorias
    })
})

app.post('/admin/vagas/editar/:id', async(request,response) => {
    const db = await dbConnection;
    const {titulo, descricao, categoria } = request.body;
    await db.run(`INSERT INTO vagas(categoria,titulo,descricao,createAt) VALUES('${categoria}','${titulo}','${descricao}', '2019-05-01 00:00:00')`)
    response.redirect('/admin/vagas/editar/')
})



const init = async() => {
    const db = await dbConnection
    await db.run('CREATE TABLE if not exists `categorias` (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('CREATE TABLE if not exists `vagas` (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT, createAt DATETIME);')
    //await db.run("UPDATE `categorias` SET categoria = 'Desenvolvimento' WHERE id = 1)")
}
init();

app.listen(port, (err) => {
    if(err){
        console.log('Erro ao iniciar o servidor')
    }else{
        console.log('Servidor Funcionando')
    }
})

