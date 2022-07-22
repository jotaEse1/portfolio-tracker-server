const {connection} = require("../db");

const getPortfolios = (req, res) => {
  const {idUser} = req.query

  const sql = `SELECT * FROM portfolio WHERE id_user = ?`

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
    .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred while trying to fetch portfolios`}}));

};

const createPortfolio = (req, res) => {
  const { idUser, name, lastUpdate, value, tickers, returns } = req.body;

  const sql = `
        INSERT INTO portfolio(id_user, name, last_update, value, tickers, returns)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  connection.query(sql, [idUser, name, lastUpdate, value, JSON.stringify(tickers), JSON.stringify(returns)])
    .then(() => {
      connection.query(`SELECT * FROM portfolio WHERE id_user = ?;`, [idUser])
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: `Portfolio "${name}" was created`, 
            data: {
              portfolios
            }
          }
        }))
        .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred`}})); 
    })
    .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred while trying to create "${name}" portfolio`}}));

};

const renamePortfolio = (req, res) => {
  const {idUser, id, name} = req.body;

  const sql = `UPDATE portfolio SET name = ? WHERE id = ?`

  connection.query(sql, [name, id])
    .then(() => {
      connection.query(`SELECT * FROM portfolio WHERE id_user = ?;`, [idUser])
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
        .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred while trying to change portfolio's name`}}));
}

const deletePortfolio = (req, res) => {
  const {idUser, id} = req.body;

  const sql = `DELETE FROM portfolio WHERE id = ?;`

  connection.query(sql, [id])
    .then(() => {
      connection.query(`SELECT * FROM portfolio WHERE id_user = ?;`, [idUser])
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: `Portfolio was deleted successfully`, 
            data: {
              portfolios
            }
          }
        }))
        .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(error => res.status(500).json({error, success: false, payload: `An error ocurred while trying to delete portfolio`}));
}

const updatePortfolio = (req, res) => {
  const { idUser, idPortfolio, name, lastUpdate, value, tickers, returns} = req.body;

  const sql = `
    UPDATE portfolio SET last_update = ?, value = ?, tickers = ?, returns = ? 
    WHERE id = ?;
  `;

  connection.query(sql, [lastUpdate, value, JSON.stringify(tickers), JSON.stringify(returns), idPortfolio])
    .then(() => {
      connection.query(`SELECT * FROM portfolio WHERE id_user = ?;`, [idUser])
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
        .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred while trying to update ${name} portfolio`}}));
}

const addHoldings = (req, res) => {
  const { idUser, idPortfolio, name, lastUpdate, value, tickers, returns, ui } = req.body;

  const sql = `
    UPDATE portfolio SET last_update = ?, value = ?, tickers = ?, returns = ? 
    WHERE id = ?;
  `;

  connection.query(sql, [lastUpdate, value, JSON.stringify(tickers), JSON.stringify(returns), idPortfolio])
    .then(() => {
      connection.query(`SELECT * FROM portfolio WHERE id_user = ?;`, [idUser])
        .then(portfolios => res.status(200).json({
          success: true, 
          payload: {
            msg: ui === 'update'? `Holdings ${ui}d` : `Holdings ${ui}ed`, 
            data: { 
              name,
              idPortfolio,
              portfolios
            }
          }
        }))
        .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred`}}));
    })
    .catch(error => res.status(500).json({error, success: false, payload: {msg: `An error ocurred while trying to ${ui} holdings`}}));
}

module.exports = {
  getPortfolios,
  insertTickers,
  createPortfolio,
  renamePortfolio,
  deletePortfolio,
  addHoldings,
  updatePortfolio
};
