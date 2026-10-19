import {runCLI} from '@wp-playground/cli';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'.runtime');
fs.mkdirSync(path.join(runtime,'wordpress'),{recursive:true,mode:0o700});
// Keep the preview password out of Git, terminal logs and the production account.
const credentialFile=path.join(runtime,'credentials.json');
if(!fs.existsSync(credentialFile))fs.writeFileSync(credentialFile,JSON.stringify({username:'mgt_preview',password:crypto.randomBytes(24).toString('base64url')},null,2),{mode:0o600});
const blueprint=JSON.parse(fs.readFileSync(path.join(root,'blueprint.json')));
const wpVersion='7.1.3';
if(!fs.existsSync(path.join(runtime,'wordpress/wp-content/languages/fa_IR.mo'))){
  const archive=path.join(runtime,'fa_IR.zip');
  if(!fs.existsSync(archive))execFileSync('curl',['-fsS','--retry','2','--max-time','30',`https://downloads.wordpress.org/translation/core/${wpVersion}/fa_IR.zip`,'-o',archive]);
  blueprint.steps.unshift({step:'unzip',zipFile:{resource:'vfs',path:'/mgt-local/fa_IR.zip'},extractToPath:'/wordpress/wp-content/languages'});
}
blueprint.steps.push({step:'runPHP',code:`<?php require '/wordpress/wp-load.php'; $credentials=json_decode(file_get_contents('/mgt-local/credentials.json'),true); $user=get_user_by('login',$credentials['username']); if (!$user) { $id=wp_create_user($credentials['username'],$credentials['password'],'preview@localhost.test'); if (is_wp_error($id)) throw new Exception($id->get_error_message()); $user=get_user_by('id',$id); $user->set_role('administrator'); } update_user_meta($user->ID,'show_admin_bar_front','false'); update_user_meta($user->ID,'locale','fa_IR'); $default=get_user_by('login','admin'); if ($default) { wp_set_password(wp_generate_password(48,true,true),$default->ID); }`});
const blueprintPath=path.join(runtime,'blueprint.json');
fs.writeFileSync(blueprintPath,JSON.stringify(blueprint),{mode:0o600});
console.log('WordPress preview: http://127.0.0.1:9400/');
console.log('Admin: http://127.0.0.1:9400/wp-admin/');
console.log('Local account credentials: '+credentialFile);
const server=await runCLI({command:'server',port:9400,php:'8.3',wp:wpVersion,'site-url':'http://127.0.0.1:9400',workers:6,blueprint,
  'mount-before-install':[{hostPath:path.join(runtime,'wordpress'),vfsPath:'/wordpress'}],
  mount:[{hostPath:path.join(root,'wp-content/themes/mgt-classic'),vfsPath:'/wordpress/wp-content/themes/mgt-classic'},{hostPath:path.join(root,'wp-content/plugins/mgt-content'),vfsPath:'/wordpress/wp-content/plugins/mgt-content'},{hostPath:path.join(root,'source'),vfsPath:'/mgt-source'},{hostPath:path.join(root,'tools'),vfsPath:'/mgt-tools'},{hostPath:runtime,vfsPath:'/mgt-local'}],
  wordpressInstallMode:fs.existsSync(path.join(runtime,'wordpress/wp-load.php'))?'install-from-existing-files-if-needed':'download-and-install'
});
// The CLI has no host flag. Rebind its HTTP server to loopback for this local preview.
await new Promise((resolve,reject)=>server.server.close(error=>error?reject(error):resolve()));
await new Promise((resolve,reject)=>server.server.listen(9400,'127.0.0.1',resolve).once('error',reject));
console.log('Ready: http://127.0.0.1:9400/ (local preview only)');
