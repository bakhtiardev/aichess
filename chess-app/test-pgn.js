const { Chess } = require('chess.js');

const pgn = `[Date "????.??.??"]
[Result "*"]
[FEN "4k3/2q2p2/4p3/3bP1Q1/p6R/r6P/6PK/5B2 w - - 0 1"]

1. Bb5+ Bc6 2. Bxc6+ Qxc6 3. Rh8+ Kd7 4. Qd8#
*`;

const chess = new Chess();
chess.loadPgn(pgn);
const history = chess.history({ verbose: true });
const solution = history.map(m => m.from + m.to + (m.promotion || ''));
console.log(JSON.stringify(solution));
