// ======================================================================== //
//
// BCI2KConfigconfig.js
// Configuration script management for BCI2000
//
// ======================================================================== //


// REQUIRES

var $ = require( 'jquery' );


// MODULE OBJECT

var BCI2KConfig = {};


// MEMBERS

BCI2KConfig.ModConfig = function() {
    this.executable = "";
    this.launchflags = [ "--local" ];
}

BCI2KConfig.ModConfig.prototype = {
    constructor: BCI2KConfig.ModConfig,
    exepath: "",
    pre: function() { return ""; },
    launch: function() { return "Start executable " + this.exepath + this.executable + " " + this.launchflags.join( ' ' ) + "; "; },
    post: function() { return ""; },
}

// SignalSource Configuration
BCI2KConfig.SourceConfig = function( source ) { 
    this.executable = ( source === undefined ) ? "SignalGenerator" : source
}
BCI2KConfig.SourceConfig.prototype = new BCI2KConfig.ModConfig();
BCI2KConfig.SourceConfig.prototype.constructor = BCI2KConfig.SourceConfig;
BCI2KConfig.SourceConfig.prototype.post = function() {
    var ret_ = "Set Parameter SamplingRate 1000Hz; ";
    return ret_;
}

// SignalProcessing Configuration
BCI2KConfig.ProcConfig = function( proc ) {
    this.executable = ( proc === undefined ) ? "DummySignalProcessing" : proc;
}
BCI2KConfig.ProcConfig.prototype = new BCI2KConfig.ModConfig();
BCI2KConfig.ProcConfig.prototype.constructor = BCI2KConfig.ProcConfig;

// Application Configuration
BCI2KConfig.AppConfig = function( app ) {
    this.executable = ( app === undefined ) ? "DummyApplication" : app;
}
BCI2KConfig.AppConfig.prototype = new BCI2KConfig.ModConfig();
BCI2KConfig.AppConfig.prototype.constructor = BCI2KConfig.AppConfig;

// SOURCE CONFIGURATIONS

// Nihon Kohden Configuration
BCI2KConfig.NKConfig = function( deviceAddress ) {
    BCI2KConfig.SourceConfig.call( this, "NihonKohdenSource" );
    this.address = deviceAddress;
}

BCI2KConfig.NKConfig.prototype = new BCI2KConfig.SourceConfig();
BCI2KConfig.NKConfig.prototype.constructor = BCI2KConfig.NKConfig;
BCI2KConfig.NKConfig.prototype.post = function() {
    var ret_ = "";
    if( this.address !== undefined ) {
        ret_ += "Set Parameter DeviceAddress "
            + this.address.toString() + "; ";
        ret_ += "Set Parameter SampleBlockSize 100; ";
    }
    return ret_;
}

// Blackrock Configuration
BCI2KConfig.BlackrockConfig = function( instances, samplingRate ) {
    BCI2KConfig.SourceConfig.call( this, "Blackrock" );
    this.instances = instances;
    this.samplingRate = samplingRate;
}

BCI2KConfig.BlackrockConfig.prototype = new BCI2KConfig.SourceConfig();
BCI2KConfig.BlackrockConfig.prototype.constructor = BCI2KConfig.BlackrockConfig;
BCI2KConfig.BlackrockConfig.prototype.post = function() {
    var ret_ = "";
    if( this.instances !== undefined )
        ret_ += "Set Parameter NSPInstances "
            + this.instances.toString() + "; ";
    if( this.samplingRate !== undefined )
        ret_ += "Set Parameter SamplingRate "
            + this.samplingRate.toString() + "; ";
    return ret_;
}

// Grapevine Configuration
BCI2KConfig.GrapevineConfig = function( samplingRate ) {
    BCI2KConfig.SourceConfig.call( this, "Grapevine" );
    this.samplingRate = samplingRate;
}

BCI2KConfig.GrapevineConfig.prototype = new BCI2KConfig.SourceConfig();
BCI2KConfig.GrapevineConfig.prototype.constructor = BCI2KConfig.GrapevineConfig;
BCI2KConfig.GrapevineConfig.prototype.post = function() {
    var ret_ = "";
    if( this.samplingRate !== undefined ) {
        ret_ += "Set Parameter SamplingRate "
            + this.samplingRate.toString() + "; ";
        if( this.samplingRate == 1000 )
            ret_ += "Set Parameter SampleBlockSize 48; ";
    }
    return ret_;
}

// Biosemi 2 Configuration
BCI2KConfig.Biosemi2Config = function( prm ) {
    BCI2KConfig.SourceConfig.call( this, "Biosemi2" );
    var fragPath = "../parms.ecog/AmpFragments/Biosemi2/";
    if( prm === undefined ) prm = 'BioSemi32CH.prm';
    this.prm = fragPath + prm;
}

BCI2KConfig.Biosemi2Config.prototype = new BCI2KConfig.SourceConfig();
BCI2KConfig.Biosemi2Config.prototype.constructor = BCI2KConfig.Biosemi2Config;
BCI2KConfig.Biosemi2Config.prototype.post = function() {
    return "Load Parameterfile " + this.prm + "; ";
}

// Storage configuration
BCI2KConfig.StorageConfig = function( subject, task, session ) {
    var ret = 'Set parameter SubjectName ' + subject + "; "; 
    if( session ) ret += 'Set parameter SubjectSession ' + session + '; ';
    ret += 'Set parameter DataFile ';
    ret += '"%24%7bSubjectName%7d/' + task + '/%24%7bSubjectName%7d_';
    ret += task + '_S%24%7bSubjectSession%7dR%24%7bSubjectRun%7d.';
    ret += '%24%7bFileFormat%7d"; ';
    return ret;
}

BCI2KConfig.StartupConfig = function( system ) {
    if( system === undefined ) system = "localhost";
    this.startupConfig = system;
}

BCI2KConfig.StartupConfig.prototype = {
    constructor: BCI2KConfig.StartupConfig,
    pre: function() { return ""; },
    system: function() { return "Startup system " + this.startupConfig + "; "; },
    post: function() { return ""; },
}

BCI2KConfig.Config = function( data ) {
    this.subject = data.subject;
    this.task = data.task;
    this.session = data.session;
    this.startupConfig = ( data.startupConfig === undefined ) ?
        new BCI2KConfig.StartupConfig() : eval( data.startupConfig );
    this.sourceConfig = ( data.sourceConfig === undefined ) ? 
        new BCI2KConfig.SourceConfig() : eval( data.sourceConfig );
    this.procConfig = ( data.procConfig === undefined ) ? 
        new BCI2KConfig.ProcConfig() : eval( data.procConfig );
    this.appConfig = ( data.appConfig === undefined ) ? 
        new BCI2KConfig.AppConfig() : eval( data.appConfig );

    if( data.startPort != 4000 ) {
        this.startupConfig.startupConfig = 
            "* SignalSource:" + data.startPort.toString() +
            " SignalProcessing:" + ( data.startPort + 1 ).toString() +
            " Application:" + ( data.startPort + 2 ).toString();
        this.sourceConfig.launchflags[ 0 ] = "127.0.0.1:" + data.startPort.toString();
        console.log( this.sourceConfig.launchflags );
        this.procConfig.launchflags[ 0 ] = "127.0.0.1:" + ( data.startPort + 1 ).toString();
        console.log( this.sourceConfig.launchflags );
        this.appConfig.launchflags[ 0 ] = "127.0.0.1:" + ( data.startPort + 2 ).toString();
    }
}

BCI2KConfig.Config.prototype = {

    constructor: BCI2KConfig.Config,

    script: function() {
        var ret_ = "Reset System; ";
        ret_ += this.startupConfig.pre();
        ret_ += this.startupConfig.system();
        ret_ += this.startupConfig.post();
        ret_ += this.sourceConfig.pre();
        ret_ += this.procConfig.pre();
        ret_ += this.appConfig.pre();
        ret_ += this.sourceConfig.launch();
        ret_ += this.procConfig.launch();
        ret_ += this.appConfig.launch();
        ret_ += "Wait for Connected; ";
        storage = BCI2KConfig.StorageConfig( this.subject, this.task, this.session );
        ret_ += storage;
        ret_ += this.sourceConfig.post();
        ret_ += this.procConfig.post();
        ret_ += this.appConfig.post();
        return ret_;
    },
}

BCI2KConfig.CreateConfig = function( callback, input, prompt ) {
    if( input === undefined ) input = {};

    function doPrompt( data ) {
        if( data.subject === undefined && prompt )
            data.subject = window.prompt( "Please enter SubjectID" );
        if( data.task === undefined && prompt )
            data.task = window.prompt( "Please enter Task" );
        callback( new BCI2KConfig.Config( data ) );
    }

    $.getJSON( "/web/localconfig.json", function( data ) {
        if( data.subject === undefined ) data.subject = input.subject;
        if( data.task === undefined ) data.task = input.task;
        if( data.session === undefined ) data.session = input.session;
        if( data.sourceConfig === undefined ) data.sourceConfig = input.sourceConfig;
        if( data.procConfig === undefined ) data.procConfig = input.procConfig;
        if( data.appConfig === undefined ) data.appConfig = input.appConfig;
        if( data.startPort === undefined ) data.startPort = input.startPort || 4000;
        doPrompt( data );
    } ).fail( function( data ) {
        doPrompt( input );
    } );
}


// EXPORT MODULE

module.exports = BCI2KConfig;


//