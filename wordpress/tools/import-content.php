<?php
/** Run with wp eval-file tools/import-content.php, or inside the local Playground blueprint. */
if (!defined('ABSPATH')) { fwrite(STDERR, "Load WordPress before running the importer.\n"); exit(1); }
if (!function_exists('mgtc_register_types')) throw new RuntimeException('Activate MGT Content first.');
mgtc_register_types();
$source = defined('MGT_IMPORT_DIR') ? MGT_IMPORT_DIR : dirname(__DIR__) . '/source';
function mgt_import_json($path) {
    if (!is_file($path)) throw new RuntimeException('Missing import file: ' . basename($path));
    return json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
}
$site = mgt_import_json($source . '/site.json');
$categories = mgt_import_json($source . '/categories.json');
$catalogue = mgt_import_json($source . '/products.json');
$products = $catalogue['items'] ?? $catalogue;
if (isset($catalogue['total']) && count($products) !== (int) $catalogue['total']) throw new RuntimeException('The product export is incomplete. Fetch all pages before importing.');
if (!get_option('mgt_content_imported')) {
    update_option('mgt_content', array_replace_recursive(mgtc_defaults()['content'], $site['content']));
    update_option('mgt_content_imported', true);
}
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
function mgt_import_image($url, $source) {
    static $cache = [];
    if (!$url) return 0;
    if (isset($cache[$url])) return $cache[$url];
    $existing = get_posts(['post_type'=>'attachment','post_status'=>'inherit','numberposts'=>1,'meta_key'=>'_mgt_source_url','meta_value'=>$url]);
    if ($existing) return $cache[$url] = $existing[0]->ID;
    $path = wp_parse_url($url, PHP_URL_PATH);
    if (!$path || strpos($path, '..') !== false) throw new RuntimeException('Invalid image path.');
    $local = $source . '/media/' . ltrim($path, '/');
    if (!is_file($local) && strpos($path, '/images/') === 0) $local = get_theme_root() . '/mgt-classic/assets' . $path;
    if (!is_file($local)) throw new RuntimeException('Image has not been exported: ' . $path);
    $temp = wp_tempnam(basename($path));
    if (!copy($local, $temp)) throw new RuntimeException('Cannot copy imported image.');
    $id = media_handle_sideload(['name'=>basename($path),'tmp_name'=>$temp], 0);
    if (is_wp_error($id)) { @unlink($temp); throw new RuntimeException($id->get_error_message()); }
    update_post_meta($id, '_mgt_source_url', $url);
    return $cache[$url] = $id;
}
$category_map = [];
foreach ($categories as $category) {
    $existing = term_exists($category['slug'], 'mgt_category');
    $term = $existing ?: wp_insert_term($category['nameFa'], 'mgt_category', ['slug'=>$category['slug']]);
    if (is_wp_error($term)) throw new RuntimeException($term->get_error_message());
    $id = (int) (is_array($term) ? $term['term_id'] : $term);
    if (!$existing) update_term_meta($id, '_mgt_nameEn', sanitize_text_field($category['nameEn']));
    $category_map[$category['id']] = $id;
}
foreach (['mgt_slide'=>$site['slides'], 'mgt_product'=>$products] as $type=>$items) foreach ($items as $i=>$item) {
    $source_id = $type . ':' . ($item['id'] ?? $item['slug'] ?? $i);
    if (get_posts(['post_type'=>$type,'post_status'=>'any','numberposts'=>1,'meta_key'=>'_mgt_source_id','meta_value'=>$source_id])) continue;
    $is_product = $type === 'mgt_product';
    $image_urls = $is_product ? ($item['images'] ?? []) : [$item['image']];
    $image_ids = [];
    foreach ($image_urls as $url) $image_ids[] = mgt_import_image($url, $source);
    $id = wp_insert_post(['post_type'=>$type,'post_title'=>sanitize_text_field($item[$is_product?'nameFa':'titleFa']),'post_name'=>$item['slug']??'', 'post_status'=>$is_product ? (($item['status']??'PUBLISHED') === 'PUBLISHED'?'publish':'draft') : (!empty($item['active'])?'publish':'draft'), 'menu_order'=>(int)($item['position']??0)], true);
    if (is_wp_error($id)) throw new RuntimeException($id->get_error_message());
    foreach (mgtc_fields($type) as $key=>$field) update_post_meta($id, '_mgt_'.$key, $field[1]==='url'?esc_url_raw($item[$key]??'', ['http','https']):sanitize_textarea_field($item[$key]??''));
    update_post_meta($id, '_mgt_images', $image_ids);
    update_post_meta($id, '_mgt_source_id', $source_id);
    if ($is_product && !empty($item['categoryId']) && isset($category_map[$item['categoryId']])) wp_set_object_terms($id, [$category_map[$item['categoryId']]], 'mgt_category');
}
flush_rewrite_rules();
echo 'Imported MGT content. Published products: ' . wp_count_posts('mgt_product')->publish . '; slides: ' . wp_count_posts('mgt_slide')->publish . ".\n";
