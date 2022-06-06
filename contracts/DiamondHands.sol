pragma solidity >=0.6.0;

contract DiamondHands {

    address owner;
    uint public developerFee;
    uint public devCommission;
    bool public pauseContract;
    address public newContractAddress;
    int public id =0;
    
    //To declare the wallet which deploys the contract as owner
    constructor() public {
        owner = msg.sender;
    }
    
    //Declaring modifiers to control access to different public functions
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    modifier contractPaused(){
        require(pauseContract == true);
        _;
    }

    modifier contractNotPaused(){
        require(pauseContract == false);
        _;
    }

    //Creating a vault in which a user can lock their ETH
    struct vault{
        address _address;
        uint _expiry;
        uint _lockedEth;
        bool _initialized;
    }

    mapping(address=> int[]) public accountIds;
    mapping(int=>vault) public vaults;
    
    
    //Creating a function for user to create a new vault. User can create as many vaults as they want
    function startAccount (uint _expiry) public payable contractNotPaused {
        require(msg.value>0, "No ETH sent");
        id+=1;
        vaults[id] = vault(msg.sender, _expiry, msg.value, true);      
        accountIds[msg.sender].push(id);
        
        uint commission = (msg.value*developerFee)/1000;
        devCommission+=commission;
        

    }

    //Creating a function for user to add more ETH to their existing vault
    function addToAccount (int _id) public payable contractNotPaused {
        require(msg.value>0);
        require(vaults[_id]._initialized==true, "Account Does Not Exist");
        
        uint netAmount = vaults[_id]._lockedEth+msg.value;
        vaults[_id] = vault(msg.sender, vaults[_id]._expiry, netAmount, true);
        uint commission = (msg.value*developerFee)/1000;
        devCommission+=commission;
        

    }

    //Creating a function for user to withdraw their locked ETH after lock in time
    function withdrawETH(int _id) public {
        require(vaults[_id]._initialized==true, "Account Does Not Exist");
        require(block.timestamp > vaults[_id]._expiry, "Expiry Not Reached Yet");
        uint withdrawAmount = vaults[_id]._lockedEth;

        //Converting the address to payable
        address payable receiver = payable(msg.sender);
        if(receiver.send(withdrawAmount)){
            vaults[_id] = vault(msg.sender, 0, 0, true);
        }
        
        


    }
    
    //Creating a function for owner of the contract to change the owner
    function setNewOwner(address _owner) public onlyOwner {

        owner = _owner;

    }

    //Owner of the contract can change the state which will pause some public functions and cannot be used.
    function setContractState(bool _state) public onlyOwner {

        pauseContract = _state;

    }
    
    //Owner can add the address of new contract when they upgrade
    function setNewContractAddress(address _address) public onlyOwner {

        newContractAddress = _address;

    }
    
    //Owner sets the fee they will deduct on each deposit. Fee percentage = developerFee/1000
    function setDevFee(uint _devFee) public onlyOwner contractNotPaused{

        developerFee = _devFee;

    }

    //Owner can withdraw his commission 
    function withdrawDevCommission() public onlyOwner{
        address payable dev = payable(owner);
        require(devCommission>0, "Dev Commission is zero");

        if(dev.send(devCommission)){
            devCommission =0;

        }


    }


}