App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  


  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("DiamondHands.json", function(DiamondHands) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.DiamondHands = TruffleContract(DiamondHands);
      // Connect provider to interact with contract
      App.contracts.DiamondHands.setProvider(App.web3Provider);

      

      return App.getInfo();
    });
  },

  getInfo: function() {
    var gw= 1000000000000000000;
    

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        //alert(App.account);
      }
    });

    // Load contract data
    App.contracts.DiamondHands.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.accounts(App.account);
    }).then(function(accountDetails) {
      console.log(accountDetails);
      //alert(accountDetails[3]);
      var details= $("#accountDetails");
      details.empty();
      var form = $("#form");
      form.empty();
      var withdraw = $("#withdraw");
      withdraw.empty();
      var timestamp = accountDetails[1]*1000;
      //alert(timestamp);
      var date = new Date(timestamp);
      //alert(date);

      if (accountDetails[3]){
        
        var detailTemplate = "<p>You have Locked "+accountDetails[2]/gw +" ETH till "+date+"</p>"
        details.append(detailTemplate);

        var formTemplate = "<form onSubmit='App.addToAccount()'; return false;><label for='ethAmount'>Amount Of Ethereum You Want To Add To Your Add</label><br><input type='number' id='ethAmount' name='ethAmount'><br><br><button type='submit' class='btn btn-primary'>Add ETH</button></form>"
        form.append(formTemplate);

        var withdrawTemplate = "<br><h3>Withdraw Your Locked ETH</h3><br><div><form onSubmit='App.withdrawETH()'; return false;><button type='submit' class='btn btn-primary'>Withdraw</button></form>"
        form.append(withdrawTemplate);

        

      }
      else{
        var detailTemplate = "<p>You have Not Locked Any ETH</p>"
        details.append(detailTemplate);

        var formTemplate = "<form onSubmit='App.startAccount()'; return false;><label for='ethAmount'>Amount Of Ethereum You Want To Lock</label><br><input type='number' id='ethAmount' name='ethAmount'><br><label for='time'>Months You Want To Lock For</label><br><input type='number' id='time' name='time'><button type='submit' class='btn btn-primary'>Lock</button></form>"
        form.append(formTemplate);

      };
      
  }).catch(function(error) {
    console.warn(error);
  });
  },

  startAccount: function() {
    var gw= 1000000000000000000;
    var expiry = $('#time').val();
    var ethAmount = $('#ethAmount').val();
    ethAmount = ethAmount*gw;
    //ethAmount = ethers.utils.parseEther(amount);
    //alert(expiry);
    //alert(ethAmount);
    App.contracts.DiamondHands.deployed().then(function(instance) {
      return instance.startAccount(expiry, { from: App.account, value: ethAmount});
    }).then(function(result) {
      // Wait for votes to update
      console.log("Result: "+result)
    }).catch(function(err) {
      console.log(err);
    });
  },
  addToAccount: function() {
    var gw= 1000000000000000000;;
    var ethAmount = $('#ethAmount').val();
    ethAmount = ethAmount*gw;
    //ethAmount = ethers.utils.parseEther(amount);
    
    //alert(ethAmount);
    App.contracts.DiamondHands.deployed().then(function(instance) {
      return instance.addToAccount({ from: App.account, value: ethAmount});
    }).then(function(result) {
      // Wait for votes to update
      console.log(result)
    }).catch(function(err) {
      console.log(err);
    });
  },
  withdrawETH: function() {
    //alert("Badger is In");
    
    
    App.contracts.DiamondHands.deployed().then(function(instance) {
      return instance.withdrawETH({ from: App.account});
    }).then(function(result) {
      //alert("executed");
      // Wait for votes to update
      console.log(result)
    }).catch(function(err) {
      
      
      console.log(err);
      //alert(err);
    });
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});