const axios = require('axios')

const Hashes = require('jshashes')
const utf8 = require('utf8')

axios.defaults.headers.common['Authorization'] = `Token 294e681391ae42390e42fdc760ae9ecf9af9d417`;


function proof_of_work(last_proof) {
    console.log("Searching for next proof");
    proof = 891189986

    while(!valid_proof(last_proof, proof)) {
        proof++
        console.log("Proof found", proof.toString())
        return proof
    }
}

function valid_proof(last_proof, proof) {
    let guess = `${last_proof}${proof}`
    guess = utf8.encode(guess)
    let hash = new Hashes.SHA256().hex(guess)
    return hash.slice(0,6) == '000000'
}


function mine() {

    axios
    .get('https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof/')
    .then(res => {
        console.log('proof response', res.data);
        console.log('proof', res.data.proof);
        last_proof = res.data.proof
        new_proof = proof_of_work(last_proof)

        console.log

        return axios.post('https://lambda-treasure-hunt.herokuapp.com/api/bc/mine/', {proof: new_proof})
    })
    .then(res => {
        console.log("mine response", res.data)

        // let coins_mined = 0;
        // if(data.get('messages') == 'New Block Forged') {
        //     coins_mined += 1
        //     console.log("Total coins mined: ", coins_mined)
        // } else { 
        //     console.log(data.get('messages'))
        // }
    })
    .catch(err => console.log('error', err));

    

}

mine()