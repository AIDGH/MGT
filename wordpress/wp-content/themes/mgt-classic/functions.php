<?php
defined('ABSPATH') || exit;
function mgt_lang() { return isset($_GET['lang']) && is_string($_GET['lang']) && $_GET['lang'] === 'en' ? 'en' : 'fa'; }
function mgt_en() { return mgt_lang() === 'en'; }
function mgt_text($fa, $en) { return mgt_en() ? $en : $fa; }
function mgt_copy() {
    static $copy;
    if ($copy === null) {
        $defaults = json_decode(file_get_contents(get_template_directory() . '/copy.json'), true);
        $content = function_exists('mgtc_content') ? mgtc_content() : [];
        $copy = array_replace($defaults[mgt_lang()], $content[mgt_lang()] ?? []);
    }
    return $copy;
}
function mgt_t($key) { return mgt_copy()[$key] ?? $key; }
function mgt_contacts() { return function_exists('mgtc_content') ? mgtc_content() : ['officePhone'=>'+982188563648','managementPhone'=>'+989121080499','companyEmail'=>'info@majdglobaltrading.com','directorEmail'=>'ceo@majdglobaltrading.com']; }
function mgt_asset($path) { return get_template_directory_uri() . '/assets/' . ltrim($path, '/'); }
function mgt_url($path = '/') {
    $url = home_url($path);
    return mgt_en() ? add_query_arg('lang', 'en', $url) : $url;
}
function mgt_permalink($id) { return mgt_en() ? add_query_arg('lang', 'en', get_permalink($id)) : get_permalink($id); }
function mgt_link($href) {
    if (substr($href, 0, 1) === '/' && substr($href, 0, 2) !== '//') return mgt_url($href);
    $parts = wp_parse_url($href);
    if (!empty($parts['host']) && in_array(strtolower($parts['host']), ['majdglobaltrading.com', 'www.majdglobaltrading.com'], true)) return mgt_url(($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '') . (isset($parts['fragment']) ? '#' . $parts['fragment'] : ''));
    return esc_url_raw($href, ['http', 'https']);
}
function mgt_meta($id, $key) { return (string) get_post_meta($id, '_mgt_' . $key, true); }
function mgt_name($id) { return mgt_meta($id, mgt_en() ? 'nameEn' : 'nameFa') ?: get_the_title($id); }
function mgt_category_name($term) { return mgt_en() ? (get_term_meta($term->term_id, '_mgt_nameEn', true) ?: $term->name) : $term->name; }
function mgt_images($id) {
    $result = [];
    foreach ((array) get_post_meta($id, '_mgt_images', true) as $image_id) {
        $url = wp_get_attachment_image_url(absint($image_id), 'full');
        if ($url) $result[] = $url;
    }
    return $result;
}
function mgt_logo() {
    $english = mgt_en();
    echo '<img' . ($english ? ' class="english-logo"' : '') . ' src="' . esc_url(mgt_asset($english ? 'brand/logo-en-beige.svg' : 'brand/logo-fa-gold.png')) . '" width="' . ($english ? '158' : '152') . '" height="' . ($english ? '82' : '101') . '" alt="' . esc_attr(mgt_text('جهان تجارت مجد', 'Majd Global Trading')) . '">';
}
function mgt_slides() {
    $slides = [];
    foreach (get_posts(['post_type'=>'mgt_slide','post_status'=>'publish','numberposts'=>-1,'orderby'=>['menu_order'=>'ASC','ID'=>'ASC']]) as $post) {
        $images = mgt_images($post->ID);
        $slides[] = ['title'=>mgt_meta($post->ID, mgt_en() ? 'titleEn':'titleFa') ?: $post->post_title, 'caption'=>mgt_meta($post->ID, mgt_en() ? 'captionEn':'captionFa'), 'image'=>$images[0] ?? mgt_asset('images/auto-parts-showcase.jpg'), 'href'=>mgt_link(mgt_meta($post->ID,'href'))];
    }
    return $slides;
}
add_action('after_setup_theme', function() { add_theme_support('title-tag'); add_theme_support('post-thumbnails'); add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']); });
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_style('mgt-site', mgt_asset('site.css'), [], filemtime(get_template_directory() . '/assets/site.css'));
    wp_enqueue_script('mgt-site', mgt_asset('site.js'), [], filemtime(get_template_directory() . '/assets/site.js'), true);
    wp_add_inline_script('mgt-site', 'window.mgtUI=' . wp_json_encode(['en'=>mgt_en(),'copy'=>mgt_t('copy'),'copied'=>mgt_t('copied'),'copyFailed'=>mgt_t('copyFailed'),'play'=>mgt_text('پخش اسلایدر','Play slideshow'),'pause'=>mgt_text('توقف اسلایدر','Pause slideshow')]) . ';', 'before');
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('global-styles');
});
add_filter('language_attributes', function() { return 'lang="' . mgt_lang() . '" dir="' . (mgt_en() ? 'ltr' : 'rtl') . '"'; });
add_filter('pre_get_document_title', function() { return is_singular('mgt_product') ? mgt_name(get_queried_object_id()) . ' | Majd Global Trading' : 'شرکت بازرگانی جهان تجارت مجد'; });
add_action('wp_head', function() {
    $title = 'شرکت بازرگانی جهان تجارت مجد';
    $image = is_singular('mgt_product') ? (mgt_images(get_queried_object_id())[0] ?? mgt_asset('images/auto-parts-showcase.jpg')) : mgt_asset('images/auto-parts-showcase.jpg');
    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $canonical = mgt_url($path);
    echo '<meta name="description" content="' . esc_attr($title) . '">';
    foreach (['og:title'=>$title,'og:description'=>$title,'og:site_name'=>$title,'og:type'=>'website','og:locale'=>mgt_en()?'en_US':'fa_IR','og:url'=>$canonical,'og:image'=>$image] as $key=>$value) echo '<meta property="' . esc_attr($key) . '" content="' . esc_attr($value) . '">';
    echo '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' . esc_attr($title) . '"><meta name="twitter:description" content="' . esc_attr($title) . '"><meta name="twitter:image" content="' . esc_url($image) . '">';
    echo '<link rel="alternate" hreflang="fa" href="' . esc_url(home_url($path)) . '"><link rel="alternate" hreflang="en" href="' . esc_url(add_query_arg('lang','en',home_url($path))) . '">';
    if (!is_singular()) echo '<link rel="canonical" href="' . esc_url($canonical) . '">';
    echo '<link rel="icon" href="' . esc_url(mgt_asset('brand/symbol-navy.png')) . '">';
}, 1);
// WordPress's default canonical URL does not know the paired English view.
remove_action('wp_head', 'rel_canonical');
add_action('wp_head', function() { if (is_singular()) echo '<link rel="canonical" href="' . esc_url(mgt_permalink(get_queried_object_id())) . '">'; });
add_action('template_redirect', function() {
    if (is_post_type_archive('mgt_product')) remove_action('template_redirect', 'redirect_canonical');
});

function mgt_catalog_query($search, $category, $page) {
    $args = ['post_type'=>'mgt_product','post_status'=>'publish','posts_per_page'=>12,'paged'=>$page,'orderby'=>['menu_order'=>'ASC','date'=>'DESC'],'mgt_search'=>$search];
    if ($category !== '') $args['tax_query'] = [['taxonomy'=>'mgt_category','field'=>'slug','terms'=>$category]];
    return new WP_Query($args);
}
add_filter('posts_where', function($where, $query) {
    $search = $query->get('mgt_search');
    if (!is_string($search) || $search === '') return $where;
    global $wpdb;
    $like = '%' . $wpdb->esc_like($search) . '%';
    // Search both languages, part numbers and translated category names; published status remains enforced by WP_Query.
    $where .= $wpdb->prepare(" AND ({$wpdb->posts}.post_title LIKE %s OR EXISTS (SELECT 1 FROM {$wpdb->postmeta} pm WHERE pm.post_id={$wpdb->posts}.ID AND pm.meta_key IN ('_mgt_nameFa','_mgt_nameEn','_mgt_sku','_mgt_descriptionFa','_mgt_descriptionEn') AND pm.meta_value LIKE %s) OR EXISTS (SELECT 1 FROM {$wpdb->term_relationships} tr JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id=tr.term_taxonomy_id JOIN {$wpdb->terms} t ON t.term_id=tt.term_id LEFT JOIN {$wpdb->termmeta} tm ON tm.term_id=t.term_id AND tm.meta_key='_mgt_nameEn' WHERE tr.object_id={$wpdb->posts}.ID AND tt.taxonomy='mgt_category' AND (t.name LIKE %s OR tm.meta_value LIKE %s)))", $like, $like, $like, $like);
    return $where;
}, 10, 2);
