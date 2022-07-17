const { connection } = require("../db");
const { formatDate } = require("../utils/formatDate");

const getPortfolios = (req, res) => {
  const {idUser} = req.query

  const sql = `
    SELECT * FROM portfolio WHERE id_user = ?
  `

  connection.query(sql, [idUser])
    .then(portfolios => {
      res.status(200).json({
      success: true, 
      payload: {
        msg: `Portfolios fetched successfully`, 
        data: {
          portfolios
        }
      }
    })})
    .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred while trying to fetch portfolios`}}));

};

const createPortfolio = (req, res) => {
  const { idUser, name, lastUpdate, value, tickers, returns } = req.body;

  const sql = `
        INSERT INTO portfolio(id_user, name, last_update, value, tickers, returns)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

  connection.query(sql, [idUser, name, lastUpdate, value, tickers, returns])
    .then(() => {
      connection.query('SELECT * FROM portfolio;')
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: `Portfolio "${name}" was created`, 
            data: {
              portfolios
            }
          }
        }))
        .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred`}})); 
    })
    .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred while trying to create "${name}" portfolio`}}));

};

const renamePortfolio = (req, res) => {
  const {id, name} = req.body;

  const sql = `UPDATE portfolio SET name = ? WHERE id = ?`

  connection.query(sql, [name, id])
    .then(() => {
      connection.query('SELECT * FROM portfolio;')
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: `Portfolio's name was changed`, 
            data: {
              name,
              portfolios
            }
          }
        }))
        .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred while trying to change portfolio's name`}}));
}

const deletePortfolio = (req, res) => {
  const {id} = req.body;

  const sql = `DELETE FROM portfolio WHERE id = ?;`

  connection.query(sql, [id])
    .then(() => {
      connection.query('SELECT * FROM portfolio;')
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: `Portfolio was deleted successfully`, 
            data: {
              portfolios
            }
          }
        }))
        .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(() => res.status(500).json({success: false, payload: `An error ocurred while trying to delete portfolio`}));
}

const updatePortfolio = (req, res) => {
  const { idUser, idPortfolio, name, lastUpdate, value, tickers, returns} = req.body;

  const sql = `
    UPDATE portfolio SET last_update = ?, value = ?, tickers = ?, returns = ? 
    WHERE id = ?;
  `;

  connection.query(sql, [lastUpdate, value, JSON.stringify(tickers), JSON.stringify(returns), idPortfolio])
    .then(() => {
      connection.query(`SELECT * FROM portfolio WHERE id_user = ${idUser};`)
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: `${name} updated`, 
            data: { 
              name,
              idPortfolio,
              portfolios
            }
          }
        }))
        .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred while trying to update ${name} portfolio`}}));
}

const addHoldings = (req, res) => {
  const { idUser, idPortfolio, name, lastUpdate, value, tickers, returns, ui } = req.body;

  const sql = `
    UPDATE portfolio SET last_update = ?, value = ?, tickers = ?, returns = ? 
    WHERE id = ?;
  `;

  connection.query(sql, [lastUpdate, value, JSON.stringify(tickers), JSON.stringify(returns), idPortfolio])
    .then(() => {
      connection.query(`SELECT * FROM portfolio WHERE id_user = ${idUser};`)
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: `Holdings ${ui}ed`, 
            data: { 
              name,
              idPortfolio,
              portfolios
            }
          }
        }))
        .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(() => res.status(500).json({success: false, payload: {msg: `An error ocurred while trying to ${ui} holdings`}}));
}


const insertTickers = (req, res) => {
  const data = req.body;
  const { id } = req.query;
  const allTickers = [];

  let sql = `SELECT * FROM portfolio WHERE id = ?;`;

  connection
    .query(sql, [id])
    .then((resp) => {
      //console.log(resp)
      if (!resp.length) res.send("No portfolio found");

      const { tickers } = resp[0];
      tickersArr = JSON.parse(tickers);

      console.log(typeof tickersArr, tickersArr);

      if (!tickersArr.length) {
        //when portfolio does not have any stock

        for (let i = 0; i < data.length; i++) {
          const obj = data[i];

          allTickers.push({
            name: obj.ticker,
            purchaseDateUnix: 0,
            purchaseDate: "",
            purchasePrice: 0,
            pruchaseStocks: 0,
            allocation: 0,
            data: obj.data,
            returns: [],
          });
        }

        sql = `
                    INSERT INTO portfolio(tickers)
                    VALUES (${JSON.stringify(allTickers)});
                `;

        console.log(allTickers);

        // connection.query(sql)
        //     .then(response => res.json(response))
        //     .catch(err => err)
      }
      res.end();
    })
    .catch((err) => res.send(err));
};

module.exports = {
  getPortfolios,
  insertTickers,
  createPortfolio,
  renamePortfolio,
  deletePortfolio,
  addHoldings,
  updatePortfolio
};
