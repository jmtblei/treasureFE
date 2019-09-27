const bcAxios = require('./blockchainConfig');
const shajs = require('sha.js');

function lastProof() {
    let last_proof = '';
    bcAxios
        .get('last_proof/')
        .then(res => {
            console.log('res', res.data);
            last_proof = JSON.stringify(res.data.proof);
            let difficulty = res.data.difficulty;
            let proof = 69696969;
            while (!valid_proof(last_proof, proof, difficulty)) {
                proof = Math.floor(Math.random() * 1000000000);
                // console.log("try again, wrong proof", proof)
            }
            setTimeout(() => {
                console.log('success', proof);
                bcAxios
                  .post('mine/', { proof: proof })
                  .then(res => {
                    console.log('mine res', res.data);
                  })
                  .catch(err => {
                    console.log(err.response);
                    lastProof();
                  });
            }, 1000);
        })
        .catch(err => {
            console.log(err.response);
        })
};

function hash(string) {
    return shajs('sha256')
        .update(string)
        .digest('hex');
};

function valid_proof(lastProof_string, proof, difficulty) {
    const guess = hash(`${lastProof_string}${proof}`);
    // console.log("this is the proof and hash", proof, guess)
    var leadZeros = '';
    for (let i = 0; i < difficulty; i++) {
      leadZeros += 0;
    }
    // console.log("zeros ", leadZeros);
    return guess.startsWith(leadZeros);
    // difficulty 6, start with 000000
};

module.exports = lastProof;

lastProof();

